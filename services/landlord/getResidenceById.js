const db = require("../../config/db");

const getResidenceById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM propiedades WHERE id_propiedad = ?",
    [id]
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

module.exports = { getResidenceById };
