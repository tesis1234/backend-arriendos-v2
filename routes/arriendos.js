const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../config/db");

// Storage de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads", "contratos"));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 1) Endpoint: Subir contrato para un arriendo
router.post(
  "/:id_arriendo/contrato",
  upload.single("contrato"),
  async (req, res) => {
    try {
      const { id_arriendo } = req.params;
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/contratos/${
        req.file.filename
      }`;

      const sql =
        "UPDATE arriendos SET contrato_archivo = ? WHERE id_arriendo = ?";
      await pool.query(sql, [fileUrl, id_arriendo]);

      res.json({ ok: true, fileUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);


// 3) Endpoint: Cambiar estado del arriendo (por ejemplo marcar contrato firmado)
router.put("/:id_arriendo/estado", async (req, res) => {
  try {
    const { id_arriendo } = req.params;
    const { estado } = req.body; // 'activo','finalizado','cancelado'
    const sql = "UPDATE arriendos SET estado = ? WHERE id_arriendo = ?";
    await pool.query(sql, [estado, id_arriendo]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// DESCARGAR PLANTILLA DE CONTRATO
router.get("/template", (req, res) => {
  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "contratos",
    "plantilla_contrato.docx"
  );

  res.download(filePath, "plantilla_contrato.docx", (err) => {
    if (err) {
      console.error("Error descargando plantilla:", err);
      return res
        .status(500)
        .json({ error: "No se pudo descargar la plantilla" });
    }
  });
});

router.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        a.*, 

        -- DATOS DEL ESTUDIANTE
        u.nombres AS estudiante_nombres,
        u.apellidos AS estudiante_apellidos,
        u.email AS estudiante_email,

        -- DATOS DE LA PROPIEDAD
        p.titulo AS propiedad_titulo,

        -- DATOS DEL PROPIETARIO REAL 
        up.nombres AS propietario_nombres,
        up.apellidos AS propietario_apellidos,
        up.email AS propietario_email,
        up.telefono AS propietario_telefono

      FROM arriendos a

      -- JOIN ESTUDIANTE
      LEFT JOIN usuarios u ON a.id_estudiante = u.id_usuario

      -- JOIN PROPIEDAD
      LEFT JOIN propiedades p ON a.id_propiedad = p.id_propiedad

      -- JOIN PROPIETARIO REAL
      LEFT JOIN usuarios up ON p.id_propietario = up.id_usuario


      ORDER BY a.id_arriendo DESC
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error cargando contratos:", err);
    res.status(500).json({ error: "Server error" });
  }
});
router.get("/:id_arriendo", async (req, res) => {
  try {
    const { id_arriendo } = req.params;

    const sql = `
      SELECT 
        a.*,
        p.titulo AS propiedad_titulo,

        -- ESTUDIANTE
        u.nombres AS estudiante_nombres,
        u.apellidos AS estudiante_apellidos,
        u.email AS estudiante_email,

        -- PROPIETARIO REAL
        up.nombres AS propietario_nombres,
        up.apellidos AS propietario_apellidos,
        up.telefono AS propietario_telefono,
        up.email AS propietario_email

      FROM arriendos a
      LEFT JOIN propiedades p ON a.id_propiedad = p.id_propiedad
      LEFT JOIN usuarios u ON a.id_estudiante = u.id_usuario
      LEFT JOIN usuarios up ON p.id_propietario = up.id_usuario

      WHERE a.id_arriendo = ?
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [id_arriendo]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Arriendo no encontrado" });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ Error obteniendo arriendo:", err);
    res.status(500).json({ error: "Error en servidor" });
  }
});

router.post("/accept", async (req, res) => {
  const {
    id_estudiante,
    id_propiedad,
    id_habitacion,
    fecha_inicio,
    fecha_fin,
    precio_acordado,
    deposito_garantia,
    condiciones_especiales,
    nombre_arrendador,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO arriendos 
        (id_estudiante, id_propiedad, id_habitacion, fecha_inicio, fecha_fin, precio_acordado, deposito_garantia, condiciones_especiales)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_estudiante,
        id_propiedad,
        id_habitacion || null,
        fecha_inicio,
        fecha_fin,
        precio_acordado,
        deposito_garantia || null,
        condiciones_especiales || null,
      ]
    );

    const rentalId = result.insertId;

    await connection.query(
      `UPDATE solicitudes_arriendo
       SET estado = 'aceptado'
       WHERE id_estudiante = ? AND id_propiedad = ? AND (id_habitacion = ? OR ? IS NULL)`,
      [id_estudiante, id_propiedad, id_habitacion, id_habitacion]
    );

    if (id_habitacion) {
      await connection.query(
        `UPDATE habitaciones SET disponibilidad = 'ocupado' WHERE id_habitacion = ?`,
        [id_habitacion]
      );
    } else {
      await connection.query(
        `UPDATE propiedades SET disponibilidad = 'ocupado' WHERE id_propiedad = ?`,
        [id_propiedad]
      );
    }

    const mensaje = `El arrendador ${nombre_arrendador} aceptó tu solicitud.`;

    await connection.query(
      `INSERT INTO notificaciones 
        (id_usuario, titulo, mensaje, tipo, data)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id_estudiante,
        "Solicitud aceptada",
        mensaje,
        "arriendo",
        JSON.stringify({
          screen: "AcceptRentalScreen",
          propertyId: id_propiedad,
          rentalId,
          nombre_arrendador,
        }),
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      id_arriendo: rentalId,
      message: "Solicitud aceptada correctamente.",
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Error al aceptar solicitud.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
