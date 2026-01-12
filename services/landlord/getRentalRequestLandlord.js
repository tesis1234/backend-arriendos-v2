const getRentalRequestsLandlord = async (ownerId) => {
  const [rows] = await db.query(`
    SELECT 
      n.id_notificacion,
      u.nombres AS firstName,
      u.apellidos AS lastName,
      u.telefono,
      JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.propertyTitle')) AS residenceName,
      p.tipo_arriendo AS propertyType,
      p.id_propiedad AS propertyId,
      sa.id_habitacion AS roomId,
      h.numero_habitacion AS roomName,
      COALESCE(h.precio_mensual, p.precio_mensual) AS precio,
      CONCAT(up.nombres, ' ', up.apellidos) AS ownerName,
      JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.tenantId')) AS tenantId,
      JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.tenantName')) AS tenantName,
      JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.tenantPhone')) AS tenantPhone,
      JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.tenantEmail')) AS tenantEmail,
      JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.tenantCedula')) AS tenantCedula
    FROM notificaciones n
    JOIN propiedades p ON JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.propertyId')) = p.id_propiedad
    JOIN usuarios u ON u.id_usuario = JSON_UNQUOTE(JSON_EXTRACT(n.data, '$.tenantId'))
    LEFT JOIN solicitudes_arriendo sa ON sa.id_estudiante = u.id_usuario AND sa.id_propiedad = p.id_propiedad
    LEFT JOIN habitaciones h ON h.id_habitacion = sa.id_habitacion
    JOIN propietarios pr ON p.id_propietario = pr.id_propietario
    JOIN usuarios up ON pr.id_propietario = up.id_usuario
    WHERE p.id_propietario = ?
      AND (sa.estado IS NULL OR sa.estado = 'pendiente')
    ORDER BY n.fecha_creacion DESC
  `, [ownerId]);

  return rows;
};
