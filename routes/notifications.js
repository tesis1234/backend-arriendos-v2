const express = require("express");
const router = express.Router();
const db = require("../config/db");

const getRentalRequests = require("../services/landlord/getRentalRequests");
const getRentalRequestsLandlord = require("../services/landlord/getRentalRequestLandlord");
// Enviar notificación
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

// Obtener notificaciones de un usuario
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM notificaciones 
      WHERE id_usuario = ? 
      ORDER BY fecha_creacion DESC
    `;

    const [notifications] = await db.execute(query, [userId]);
    res.json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener notificaciones no leídas
router.get("/user/:userId/unread", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM notificaciones 
      WHERE id_usuario = ? AND leida = 0 
      ORDER BY fecha_creacion DESC
    `;

    const [notifications] = await db.execute(query, [userId]);
    res.json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/user/:userId/unread/landlord", async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT n.*
      FROM notificaciones n
      JOIN solicitudes_arriendo s
        ON JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.tenantId')) = s.id_estudiante
       AND JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.propertyId')) = s.id_propiedad
      WHERE n.id_usuario = ? AND n.leida = 0 AND s.estado = 'pendiente'
      ORDER BY n.fecha_creacion DESC
    `;

    const [notifications] = await db.execute(query, [userId]);
    res.json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Marcar como leída
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE notificaciones 
      SET leida = 1, fecha_leida = NOW() 
      WHERE id_notificacion = ?
    `;

    await db.execute(query, [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/requests", async (req, res) => {
  const { ownerId } = req.query;

  if (!ownerId) {
    return res.status(400).json({ error: "ownerId es requerido" });
  }

  try {
    const requests = await getRentalRequests(ownerId);
    res.json(requests);
  } catch (error) {
    console.error("Error al obtener solicitudes de arriendo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Verifica si ya existe una solicitud de arriendo
router.get("/check-request", async (req, res) => {
  const { tenantId, propertyId } = req.query;

  if (!tenantId || !propertyId) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  try {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total FROM notificaciones 
       WHERE id_usuario = ? 
       AND tipo = 'arriendo' 
       AND JSON_EXTRACT(data, '$.propertyId') = ?`,
      [tenantId, propertyId]
    );

    const alreadyRequested = rows[0].total > 0;
    res.json({ alreadyRequested });
  } catch (error) {
    console.error("Error al verificar solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// POST /api/notifications/reject
router.post('/reject', async (req, res) => {
  const { tenantId, propertyId, roomId } = req.body;

  try {
    const result = await db.query(`
      UPDATE solicitudes_arriendo
      SET estado = 'rechazado'
      WHERE id_estudiante = ? AND id_propiedad = ? AND (id_habitacion = ? OR ? IS NULL)
    `, [tenantId, propertyId, roomId, roomId]);

    res.status(200).json({ message: 'Solicitud rechazada correctamente.' });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ error: 'Error al rechazar solicitud.' });
  }
});

module.exports = router;
