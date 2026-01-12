const db = require("../../config/db");

const getResidencesByUser = async (userId) => {
  const [rows] = await db.execute(
    "SELECT * FROM propiedades WHERE tipo_arriendo = 'Residencia' AND id_propietario = ?",
    [userId]
  );
  console.log(
    "URLs generadas:",
    rows.map((row) =>
      JSON.parse(row.fotos).map(
        (foto) => `http://192.168.1.3:3000/images/${foto}`
      )
    )
  );

  return rows.map((row) => ({
    ...row,
    imagenUrls: JSON.parse(row.fotos).map(
      (foto) => `http://192.168.1.3:3000/images/${foto}`
    ), // Maneja múltiples imágenes
  }));
};

module.exports = { getResidencesByUser };
