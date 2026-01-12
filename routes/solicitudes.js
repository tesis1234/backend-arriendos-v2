const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/solicitudes", async (req, res) => {
  const { id_estudiante, id_propiedad, id_habitacion = null } = req.body;

  if (!id_estudiante || !id_propiedad) {
    return res.status(400).json({ error: "Faltan parámetros obligatorios" });
  }

  try {
    const [existing] = await db.execute(
      "SELECT estado FROM solicitudes_arriendo WHERE id_estudiante = ? AND id_propiedad = ? AND id_habitacion <=> ?",
      [id_estudiante, id_propiedad, id_habitacion]
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Ya existe una solicitud para esta propiedad" });
    }

    await db.execute(
      "INSERT INTO solicitudes_arriendo (id_estudiante, id_propiedad, id_habitacion) VALUES (?, ?, ?)",
      [id_estudiante, id_propiedad, id_habitacion]
    );

    res.status(201).json({ message: "Solicitud registrada exitosamente" });
  } catch (error) {
    console.error("Error al registrar solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/solicitudes/check", async (req, res) => {
  const { id_estudiante, id_propiedad } = req.query;

  if (!id_estudiante || !id_propiedad) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT estado FROM solicitudes_arriendo WHERE id_estudiante = ? AND id_propiedad = ?",
      [id_estudiante, id_propiedad]
    );

    if (rows.length > 0) {
      res.json({ estado: rows[0].estado });
    } else {
      res.json({ estado: null });
    }
  } catch (error) {
    console.error("Error al verificar solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/solicitudes/room/check", async (req, res) => {
  const { id_estudiante, id_propiedad, id_habitacion } = req.query;

  if (!id_estudiante || !id_propiedad) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    // Si se proporciona id_habitacion, buscar solicitud específica para esa habitación
    if (id_habitacion) {
      const [rows] = await db.execute(
        "SELECT estado FROM solicitudes_arriendo WHERE id_estudiante = ? AND id_propiedad = ? AND id_habitacion = ?",
        [id_estudiante, id_propiedad, id_habitacion]
      );

      if (rows.length > 0) {
        res.json({ estado: rows[0].estado });
      } else {
        res.json({ estado: null });
      }
    } else {
      // Si no se proporciona id_habitacion, buscar cualquier solicitud para la propiedad
      const [rows] = await db.execute(
        "SELECT estado FROM solicitudes_arriendo WHERE id_estudiante = ? AND id_propiedad = ?",
        [id_estudiante, id_propiedad]
      );

      if (rows.length > 0) {
        res.json({ estado: rows[0].estado });
      } else {
        res.json({ estado: null });
      }
    }
  } catch (error) {
    console.error("Error al verificar solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/solicitudes/check-room", async (req, res) => {
  const { id_estudiante, id_propiedad, id_habitacion } = req.query;

  if (!id_estudiante || !id_propiedad) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    // Si se proporciona id_habitacion, buscar solicitud específica para esa habitación
    if (id_habitacion) {
      const [rows] = await db.execute(
        "SELECT estado FROM solicitudes_arriendo WHERE id_estudiante = ? AND id_propiedad = ? AND id_habitacion = ?",
        [id_estudiante, id_propiedad, id_habitacion]
      );
      if (rows.length > 0) {
        return res.json({ estado: rows[0].estado });
      } else {
        return res.json({ estado: null });
      }
    }

    // Si no se proporciona id_habitacion, buscar cualquier solicitud para la propiedad
    const [rows] = await db.execute(
      "SELECT estado FROM solicitudes_arriendo WHERE id_estudiante = ? AND id_propiedad = ?",
      [id_estudiante, id_propiedad]
    );
    if (rows.length > 0) {
      res.json({ estado: rows[0].estado });
    } else {
      res.json({ estado: null });
    }
  } catch (error) {
    console.error("Error al verificar solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Alias para compatibilidad con TenantRoomViewScreen.js
router.get("/solicitudes/room/check", (req, res) => {
  res.redirect(
    307,
    `/api/solicitudes/check-room${req.url.includes("?") ? req.url : ""}`
  );
});

module.exports = router;
