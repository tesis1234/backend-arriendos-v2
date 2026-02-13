const db = require("../../config/db");

const getRoomsByUser = async (userId) => {
  const [rows] = await db.execute(
    `SELECT h.*, p.direccion, p.latitud, p.longitud
     FROM habitaciones h
     JOIN propiedades p ON h.id_propiedad = p.id_propiedad
     WHERE p.id_propietario = ?`,
    [userId]
  );

  return rows.map((row) => ({
    ...row,
    imagenUrls: row.fotos
      ? JSON.parse(row.fotos).map(
          (foto) => `https://backend-arriendos-v2-production.up.railway.app/images/${foto}`
        )
      : [],
  }));
};

module.exports = { getRoomsByUser };
