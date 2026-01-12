const db = require("../../config/db");

const deleteResidence = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM propiedades WHERE id_propiedad = ?", [id]);
    return { success: result.affectedRows > 0 };
  } catch (error) {
    console.error("Error al eliminar la residencia:", error);
    return { success: false, error: "Error al eliminar la residencia" };
  }
};

module.exports = { deleteResidence };
