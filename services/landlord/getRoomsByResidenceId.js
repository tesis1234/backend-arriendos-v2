const db = require("../../config/db");

const getRoomsByResidenceId = async (residenceId) => {
  const [rows] = await db.execute(
    `SELECT 
      h.id_habitacion,
      h.numero_habitacion,
      h.capacidad,
      h.precio_mensual,
      h.disponibilidad,
      h.caracteristicas,
      h.fotos,
      p.direccion,
      p.latitud,
      p.longitud,
      p.tipo_arrendatario,
      p.metodos_pago,
      h.comodidades,
      h.convivencia,
      p.cantidad_habitaciones,
      p.cantidad_banos_individuales,
      p.cantidad_salas,
      p.cantidad_parqueaderos
    FROM habitaciones h
    JOIN propiedades p ON h.id_propiedad = p.id_propiedad
    WHERE h.id_propiedad = ? AND p.tipo_arriendo = 'Residencia'`,
    [residenceId]
  );

  return rows.map((row) => ({
    ...row,
    imagenUrls: row.fotos
      ? JSON.parse(row.fotos).map(
          (foto) => `https://backend-arriendos-v2-production.up.railway.app/images/${foto}`
        )
      : [],
  }));
};

module.exports = { getRoomsByResidenceId };
