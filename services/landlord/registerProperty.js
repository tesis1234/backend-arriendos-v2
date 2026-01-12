const db = require('../../config/db');

async function registerProperty(data) {
  
  const {
    id_propietario,
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
    fotos 
  } = data;

 
  let fotosNombres;
  try {
    fotosNombres = JSON.parse(fotos); // Convierte de JSON a array
  } catch (error) {
    console.error("Error al parsear fotos:", error);
    return { success: false, message: "Error al procesar las fotos." };
  }

  try {
    const [result] = await db.query(
      `INSERT INTO propiedades (
        id_propietario, titulo, tipo_arriendo, sector, tipo_arrendatario,
        cantidad_hombres, cantidad_mujeres, cantidad_habitaciones,
        cantidad_banos_individuales, cantidad_banos_compartidos,
        cantidad_salas, cantidad_parqueaderos, metodos_pago, comodidades,
        convivencia, descripcion, direccion, latitud, longitud,
        precio_mensual, fotos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_propietario,
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
        JSON.stringify(fotosNombres) // Guarda como JSON
      ]
    );

    return {
      success: true,
      message: "Propiedad registrada exitosamente",
      id_propiedad: result.insertId
    };
  } catch (error) {
    console.error("Error al registrar propiedad:", error);
    return { success: false, message: error.message };
  }
}

module.exports = { registerProperty };
