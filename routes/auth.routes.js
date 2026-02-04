const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const uploadProfileImage = require("../middlewares/uploadProfileImage");

const bcrypt = require("bcryptjs");
const { registerUser } = require("../services/common/registerUser");
const { loginUser } = require("../services/common/loginUser");
const { registerProperty } = require("../services/landlord/registerProperty");
const {
  getResidencesByUser,
} = require("../services/landlord/getResidencesByUser");
const { getResidenceById } = require("../services/landlord/getResidenceById");
const { updateResidence } = require("../services/landlord/updateResidence");
const { deleteResidence } = require("../services/landlord/deleteResidence");
//departamentos
const {
  getDepartmentByUser,
} = require("../services/landlord/getDepartmentByUser");
const { updateDepartment } = require("../services/landlord/updateDepartment");
const { deleteDepartment } = require("../services/landlord/deleteDepartment");
const { getDepartmentById } = require("../services/landlord/getDepartmentById");
//cuartos
const { registerRoom } = require("../services/landlord/registerRoom");
const { getRoomsByUser } = require("../services/landlord/getRoomByUser");
const { deleteRoom } = require("../services/landlord/deleteRoom");

const {
  getRoomsByResidenceId,
} = require("../services/landlord/getRoomsByResidenceId");
const { updateRoom } = require("../services/landlord/updateRoom");

//
const { getAllProperties } = require("../services/tenant/getAllProperties");

const db = require("../config/db");
const {
  handlePasswordReset,
} = require("../services/common/passwordResetService");

router.post("/login", async (req, res) => {
  console.log('🔥 ENTRO A LA RUTA LOGIN');
  const result = await loginUser(req.body);
  res.status(result.success ? 200 : 401).json(result);
});

router.post("/register", async (req, res) => {
  const { fecha_nacimiento } = req.body;

  if (!fecha_nacimiento) {
    return res
      .status(400)
      .json({ error: "La fecha de nacimiento es obligatoria." });
  }

  const birthDate = new Date(fecha_nacimiento);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return res.status(400).json({
      error: "Debes tener al menos 18 años para registrarte en la aplicación.",
    });
  }

  const result = await registerUser(req.body);
  res.status(result.success ? 200 : 400).json(result);
});

router.post(
  "/register-property",
  upload.array("fotos", 5),
  async (req, res) => {
    console.log("Archivos recibidos:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No se han subido imágenes." });
    }

    const fotos = req.files.map((file) => file.filename);
    const data = {
      ...req.body,
      fotos: JSON.stringify(fotos), // Guarda como JSON
    };

    const result = await registerProperty(data);
    res.status(result.success ? 200 : 400).json(result);
  }
);

router.get("/residences", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Falta el parámetro userId" });
  }

  try {
    const residences = await getResidencesByUser(userId);
    res.json(residences);
  } catch (error) {
    console.error("Error al obtener residencias:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/residences/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const residence = await getResidenceById(id);
    if (!residence) {
      return res.status(404).json({ error: "Residencia no encontrada" });
    }
    res.json(residence);
  } catch (error) {
    console.error("Error al obtener la residencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/residences/:id", upload.array("fotos", 5), async (req, res) => {
  const { id } = req.params;

  let fotos = [];

  try {
    // Obtener imágenes existentes desde el body
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    // Obtener nuevas imágenes subidas
    const newImages = req.files ? req.files.map((file) => file.filename) : [];

    // Combinar ambas
    fotos = [...existingImages, ...newImages];
  } catch (e) {
    console.error("Error al procesar imágenes:", e);
    return res.status(400).json({ error: "Error al procesar las imágenes." });
  }

  const data = {
    ...req.body,
    fotos: JSON.stringify(fotos),
  };

  try {
    const result = await updateResidence(id, data);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error al actualizar la residencia:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

router.delete("/residences/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteResidence(id);
    if (!result.success) {
      return res
        .status(404)
        .json({ error: "Residencia no encontrada o ya eliminada" });
    }
    res.json({ success: true, message: "Residencia eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la residencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Departamentos

router.get("/departments", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Falta el parámetro userId" });
  }

  try {
    const departments = await getDepartmentByUser(userId);
    res.json(departments);
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/departments/:id", upload.array("fotos", 5), async (req, res) => {
  const { id } = req.params;

  let fotos = [];

  try {
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];

    const newImages = req.files ? req.files.map((file) => file.filename) : [];

    fotos = [...existingImages, ...newImages];
  } catch (e) {
    console.error("Error al procesar imágenes:", e);
    return res.status(400).json({ error: "Error al procesar las imágenes." });
  }

  const data = {
    ...req.body,
    fotos: JSON.stringify(fotos),
  };

  try {
    const result = await updateDepartment(id, data);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error al actualizar el departamento:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

router.delete("/departments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteDepartment(id);
    if (!result.success) {
      return res
        .status(404)
        .json({ error: "departamento no encontrado o ya eliminado" });
    }
    res.json({ success: true, message: "Departamento eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el departamento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/departments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const department = await getDepartmentById(id);
    if (!department) {
      return res.status(404).json({ error: "Departamento no encontrado" });
    }
    res.json(department);
  } catch (error) {
    console.error("Error al obtener el departamento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Cuartos
router.post("/register-room", upload.array("fotos", 5), async (req, res) => {
  console.log("Archivos recibidos:", req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No se han subido imágenes." });
  }

  const fotos = req.files.map((file) => file.filename);
  const data = {
    ...req.body,
    fotos: JSON.stringify(fotos), // Guarda como JSON
  };

  const result = await registerRoom(data);
  res.status(result.success ? 200 : 400).json(result);
});
router.get("/rooms", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Falta el parámetro userId" });
  }

  try {
    const residences = await msByUser(userId);
    res.json(residences);
  } catch (error) {
    console.error("Error al obtener cuartos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/rooms/by-residence/:residenceId", async (req, res) => {
  const { residenceId } = req.params;

  try {
    const rooms = await getRoomsByResidenceId(residenceId);
    res.json(rooms);
  } catch (error) {
    console.error("Error al obtener cuartos por residencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/rooms/:id", upload.array("fotos", 5), async (req, res) => {
  const { id } = req.params;
  let fotos = [];

  try {
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : [];
    const newImages = req.files ? req.files.map((file) => file.filename) : [];
    fotos = [...existingImages, ...newImages];
  } catch (e) {
    console.error("Error al procesar imágenes:", e);
    return res.status(400).json({ error: "Error al procesar las imágenes." });
  }

  const data = {
    ...req.body,
    fotos: JSON.stringify(fotos),
  };

  try {
    const result = await updateRoom(id, data);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error al actualizar el cuarto:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

router.delete("/rooms/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await deleteRoom(id);
    if (!result.success) {
      return res
        .status(404)
        .json({ error: "Cuarto no encontrado o ya eliminado" });
    }
    res.json({ success: true, message: "Cuarto eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el cuarto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

////
router.get("/all-properties", async (req, res) => {
  try {
    const properties = await getAllProperties();

    res.json(properties);
  } catch (error) {
    console.error("Error al obtener propiedades:", error);
    res.status(500).json({ error: "Error al obtener propiedades" });
  }
});

//notificaciones
router.get("/properties/:id", async (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM propiedades WHERE id_propiedad = ?";
  const [rows] = await db.execute(query, [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: "Propiedad no encontrada" });
  }

  res.json(rows[0]);
});

router.post("/send", async (req, res) => {
  try {
    const { recipientId, senderId, type, title, message, data } = req.body;

    const query = `
      INSERT INTO notificaciones (id_usuario, titulo, mensaje, tipo, data, fecha_creacion)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    await db.execute(query, [
      recipientId,
      title,
      message,
      type,
      JSON.stringify(data),
    ]);

    res.json({ success: true, message: "Notificación enviada" });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/rentals/accept", async (req, res) => {
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

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Crear registro en la tabla arriendos
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

    // Actualizar el estado de la solicitud de arriendo
    await connection.query(
      `UPDATE solicitudes_arriendo 
       SET estado = 'aceptado' 
       WHERE id_estudiante = ? AND id_propiedad = ? AND (id_habitacion = ? OR ? IS NULL)`,
      [id_estudiante, id_propiedad, id_habitacion, id_habitacion]
    );

    // Marcar habitación o propiedad como ocupada
    if (id_habitacion) {
      await connection.query(
        `UPDATE habitaciones 
         SET disponibilidad = 'ocupado' 
         WHERE id_habitacion = ?`,
        [id_habitacion]
      );
    } else {
      await connection.query(
        `UPDATE propiedades 
         SET disponibilidad = 'ocupado' 
         WHERE id_propiedad = ?`,
        [id_propiedad]
      );
    }

    // Enviar notificación al estudiante
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

    // Confirmar todos los cambios
    await connection.commit();

    res.status(200).json({
      success: true,
      id_arriendo: rentalId,
      message:
        "Solicitud aceptada correctamente. Habitación o propiedad marcada como ocupada.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al aceptar solicitud:", error);
    res.status(500).json({
      success: false,
      message: "Error al aceptar solicitud.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

router.get("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await db.query("SELECT * FROM usuarios WHERE id_usuario = ?", [
      userId,
    ]);
    if (user.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario", error });
  }
});

// Obtener perfil

router.get("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [[usuario]] = await db.query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    let banco_preferido = null;
    let numero_cuenta = null;

    if (usuario.tipo === "propietario") {
      const [[prop]] = await db.query(
        "SELECT banco_preferido, numero_cuenta FROM propietarios WHERE id_propietario = ?",
        [id]
      );
      if (prop) {
        banco_preferido = prop.banco_preferido;
        numero_cuenta = prop.numero_cuenta;
      }
    } else if (usuario.tipo === "estudiante") {
      const [[est]] = await db.query(
        "SELECT banco_preferido, numero_cuenta FROM estudiantes WHERE id_estudiante = ?",
        [id]
      );
      if (est) {
        banco_preferido = est.banco_preferido;
        numero_cuenta = est.numero_cuenta;
      }
    }

    res.json({
      ...usuario,
      banco_preferido,
      numero_cuenta,
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Actualizar perfil
router.put(
  "/usuarios/:id",
  uploadProfileImage.single("foto_perfil"),
  async (req, res) => {
    const { id } = req.params;
    const {
      cedula,
      nombres,
      apellidos,
      email,
      telefono,
      tipo,
      tipo_documento,
      fecha_nacimiento,
      banco_preferido,
      numero_cuenta,
      contrasena_actual,
      nueva_contrasena,
    } = req.body;
    // Validar mayoría de edad
    if (fecha_nacimiento) {
      const birthDate = new Date(fecha_nacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        return res.status(400).json({
          message: "Debes tener al menos 18 años para modificar tu perfil.",
        });
      }
    }

    const foto_perfil = req.file ? req.file.filename : null;
    console.log("Archivo recibido:", req.file);
    try {
      // Validar y actualizar contraseña si se envía
      if (
        (nueva_contrasena && !contrasena_actual) ||
        (!nueva_contrasena && contrasena_actual)
      ) {
        return res.status(400).json({
          message: "Debe ingresar tanto la contraseña actual como la nueva.",
        });
      }

      if (nueva_contrasena && contrasena_actual) {
        const [[usuario]] = await db.query(
          "SELECT password FROM usuarios WHERE id_usuario = ?",
          [id]
        );

        const match = await bcrypt.compare(contrasena_actual, usuario.password);
        if (!match) {
          return res
            .status(400)
            .json({ message: "Contraseña actual incorrecta" });
        }

        const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);
        await db.query(
          "UPDATE usuarios SET password = ? WHERE id_usuario = ?",
          [hashedPassword, id]
        );
      }

      // Actualizar datos del usuario
      const campos = [
        cedula,
        nombres,
        apellidos,
        email,
        telefono,
        tipo_documento,
        fecha_nacimiento,
      ];
      let query = `UPDATE usuarios SET cedula = ?, nombres = ?, apellidos = ?, email = ?, telefono = ?, tipo_documento = ?, fecha_nacimiento = ?`;

      if (foto_perfil) {
        query += `, foto_perfil = ?`;
        campos.push(foto_perfil);
      }

      query += ` WHERE id_usuario = ?`;
      campos.push(id);

      await db.query(query, campos);

      // Actualizar tabla secundaria
      if (tipo === "propietario") {
        await db.query(
          `UPDATE propietarios SET banco_preferido = ?, numero_cuenta = ? WHERE id_propietario = ?`,
          [banco_preferido, numero_cuenta, id]
        );
      } else if (tipo === "estudiante") {
        await db.query(
          `UPDATE estudiantes SET banco_preferido = ?, numero_cuenta = ? WHERE id_estudiante = ?`,
          [banco_preferido, numero_cuenta, id]
        );
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  }
);

router.post("/reset-password", handlePasswordReset);

// Rechazar solicitud de arriendo
router.post("/notifications/reject", async (req, res) => {
  const { tenantId, propertyId, roomId } = req.body;

  try {
    await db.query(
      `UPDATE solicitudes_arriendo
       SET estado = 'rechazado'
       WHERE id_estudiante = ? 
         AND id_propiedad = ? 
         AND (id_habitacion = ? OR ? IS NULL)`,
      [tenantId, propertyId, roomId, roomId]
    );

   
    res.json({ success: true, message: "Solicitud rechazada correctamente" });
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    res.status(500).json({ error: "Error al rechazar solicitud" });
  }
});

module.exports = router;
