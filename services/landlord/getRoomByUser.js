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
          (foto) => `http://192.168.1.3:3000/images/${foto}`
        )
      : [],
  }));
};

module.exports = { getRoomsByUser };
