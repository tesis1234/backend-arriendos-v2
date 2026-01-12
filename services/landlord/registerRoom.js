const db = require('../../config/db');

async function registerRoom(data) {
  const {
    id_propiedad,
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
    const [result] = await db.query(
      `INSERT INTO habitaciones (
        id_propiedad,
        numero_habitacion,
        capacidad,
        precio_mensual,
        caracteristicas,
        fotos,
        comodidades,
        convivencia,
        disponibilidad
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_propiedad,
        numero_habitacion,
        capacidad,
        precio_mensual,
        caracteristicas,
        JSON.stringify(fotosNombres),
        comodidades,
        convivencia,
        disponibilidad
      ]
    );

    return {
      success: true,
      message: "Habitación registrada exitosamente",
      id_habitacion: result.insertId
    };
  } catch (error) {
    console.error("Error al registrar habitación:", error);
    return { success: false, message: error.message };
  }
}

module.exports = { registerRoom };
