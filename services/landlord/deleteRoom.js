const db = require("../../config/db");

const deleteRoom = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM habitaciones WHERE id_habitacion = ?", [id]);
    return { success: result.affectedRows > 0 };
  } catch (error) {
    console.error("Error al eliminar el cuarto:", error);
    return { success: false, error: "Error al eliminar el cuarto" };
  }
};

module.exports = { deleteRoom };
