const db = require("../../config/db");

async function updateResidence(id, data) {
  const {
    titulo,
    tipo_arriendo,
    sector,
    tipo_arrendatario,
    cantidad_hombres,
    cantidad_mujeres,
    cantidad_habitaciones,
    cantidad_banos_individuales,
    cantidad_banos_compartidos,
    cantidad_salas,
    cantidad_parqueaderos,
    metodos_pago,
    comodidades,
    convivencia,
    descripcion,
    direccion,
    latitud,
    longitud,
    precio_mensual,
    fotos,
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
      `UPDATE propiedades SET
        titulo = ?, tipo_arriendo = ?, sector = ?, tipo_arrendatario = ?,
        cantidad_hombres = ?, cantidad_mujeres = ?, cantidad_habitaciones = ?,
        cantidad_banos_individuales = ?, cantidad_banos_compartidos = ?,
        cantidad_salas = ?, cantidad_parqueaderos = ?, metodos_pago = ?,
        comodidades = ?, convivencia = ?, descripcion = ?, direccion = ?,
        latitud = ?, longitud = ?, precio_mensual = ?, fotos = ?
      WHERE id_propiedad = ?`,
      [
        titulo,
        tipo_arriendo,
        sector,
        tipo_arrendatario,
        cantidad_hombres,
        cantidad_mujeres,
        cantidad_habitaciones,
        cantidad_banos_individuales,
        cantidad_banos_compartidos,
        cantidad_salas,
        cantidad_parqueaderos,
        metodos_pago,
        comodidades,
        convivencia,
        descripcion,
        direccion,
        latitud,
        longitud,
        precio_mensual,
        JSON.stringify(fotosNombres),
        id,
      ]
    );

    return { success: true, message: "Residencia actualizada exitosamente" };
  } catch (error) {
    console.error("Error al actualizar propiedad:", error);
    return { success: false, message: error.message };
  }
}

module.exports = { updateResidence };
