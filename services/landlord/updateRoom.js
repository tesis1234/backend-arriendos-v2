const db = require('../../config/db');

async function updateRoom(id, data) {
  const {
    numero_habitacion,
    capacidad,
    precio_mensual,
    caracteristicas,
    fotos,
    comodidades,
    convivencia,
    disponibilidad
  } = data;

  let fotosNombres;
  try {
    fotosNombres = JSON.parse(fotos);
  } catch (error) {
    console.error("Error al parsear fotos:", error);
    return { success: false, message: "Error al procesar las fotos." };
  }

  try {
    await db.query(
      `UPDATE habitaciones SET
        numero_habitacion = ?,
        capacidad = ?,
        precio_mensual = ?,
        caracteristicas = ?,
        fotos = ?,
        comodidades = ?,
        convivencia = ?,
        disponibilidad = ?
      WHERE id_habitacion = ?`,
      [
        numero_habitacion,
        capacidad,
        precio_mensual,
        caracteristicas,
        JSON.stringify(fotosNombres),
        comodidades,
        convivencia,
        disponibilidad,
        id
      ]
    );
    return { success: true, message: "Habitación actualizada exitosamente" };
  } catch (error) {
    console.error("Error al actualizar habitación:", error);
    return { success: false, message: error.message };
  }
}

module.exports = { updateRoom };
