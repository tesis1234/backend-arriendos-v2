const db = require("../../config/db");

const getDepartmentByUser = async (userId) => {
  const [rows] = await db.execute(
    "SELECT * FROM propiedades WHERE tipo_arriendo = 'Departamento' AND id_propietario = ?",
    [userId]
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

module.exports = { getDepartmentByUser };
