const db = require("../../config/db");

const getAllProperties = async (userId) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM propiedades WHERE tipo_arriendo = 'Residencia' OR tipo_arriendo = 'Departamento'"

    );
    return rows;
  } catch (error) {
    console.error("Error al obtener propiedades:", error);
    throw error;
  }
};

module.exports = { getAllProperties };
