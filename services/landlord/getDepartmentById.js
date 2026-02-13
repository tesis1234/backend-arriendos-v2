const db = require("../../config/db");

const getDepartmentById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM propiedades WHERE id_propiedad = ?",
    [id]
  );
  console.log(
    "URLs generadas:",
    rows.map((row) =>
      JSON.parse(row.fotos).map(
        (foto) => `https://backend-arriendos-v2-production.up.railway.app/images/${foto}`
      )
    )
  );

  return rows.map((row) => ({
    ...row,
    imagenUrls: JSON.parse(row.fotos).map(
      (foto) => `https://backend-arriendos-v2-production.up.railway.app/images/${foto}`
    ), // Maneja múltiples imágenes
  }));
};

module.exports = { getDepartmentById };
