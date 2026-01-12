const db = require("../../config/db");

const deleteDepartment = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM propiedades WHERE id_propiedad = ?", [id]);
    return { success: result.affectedRows > 0 };
  } catch (error) {
    console.error("Error al eliminar el departamento:", error);
    return { success: false, error: "Error al eliminar el departamento" };
  }
};

module.exports = { deleteDepartment };
