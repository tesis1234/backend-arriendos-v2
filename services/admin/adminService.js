const db = require("../../config/db");

// =======================
//  CONTAR USUARIOS
// =======================
const countUsuarios = async (req, res) => {
  try {
    const [result] = await db.query("SELECT COUNT(*) AS total FROM usuarios");
    res.json({ total: result[0].total });
  } catch (error) {
    console.error("Error contando usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// =======================
// CONTAR PROPIEDADES + OCUPACIÓN
// =======================
const countPropiedades = async (req, res) => {
  try {
    const [residencias] = await db.query(
      "SELECT COUNT(*) AS total FROM propiedades WHERE LOWER(tipo_arriendo) LIKE '%resid%'"
    );

    const [departamentos] = await db.query(
      "SELECT COUNT(*) AS total FROM propiedades WHERE LOWER(tipo_arriendo) LIKE '%depa%'"
    );

    const [ocupadas] = await db.query(
      "SELECT COUNT(*) AS total FROM propiedades WHERE disponibilidad = 'ocupado'"
    );

    const [totalProps] = await db.query(
      "SELECT COUNT(*) AS total FROM propiedades"
    );

    const ocupacion =
      totalProps[0].total === 0
        ? 0
        : Math.round((ocupadas[0].total / totalProps[0].total) * 100);

    res.json({
      residencias: residencias[0].total,
      departamentos: departamentos[0].total,
      ocupacion,
    });
  } catch (error) {
    console.error("Error contando propiedades:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// =======================
//  CONTRATOS E INGRESOS
// =======================
const countArriendos = async (req, res) => {
  try {
    const [total] = await db.query("SELECT COUNT(*) AS total FROM arriendos");

    const [activos] = await db.query(
      "SELECT COUNT(*) AS total FROM arriendos WHERE estado='activo'"
    );

    // 🔥 SUMAR TODOS LOS PRECIOS DE PROPIEDADES
    const [ingresos] = await db.query(
      "SELECT SUM(precio_mensual) AS suma FROM propiedades"
    );

    res.json({
      total: total[0].total,
      activos: activos[0].total,
      ingresos: ingresos[0].suma || 0,
    });
  } catch (error) {
    console.error("Error contando arriendos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// =======================
// LISTAR USUARIOS
// =======================
const getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id_usuario, cedula, nombres, apellidos, email, telefono, tipo, estado, fecha_registro FROM usuarios"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo usuarios:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// =======================
// EDITAR USUARIO
// =======================
const updateUsuario = async (req, res) => {
  try {
    const { nombres, apellidos, email, telefono } = req.body;
    const { id } = req.params;

    await db.query(
      "UPDATE usuarios SET nombres=?, apellidos=?, email=?, telefono=? WHERE id_usuario=?",
      [nombres, apellidos, email, telefono, id]
    );

    res.json({ success: true, msg: "Usuario actualizado correctamente" });
  } catch (err) {
    console.error("Error editando usuario:", err);
    res.status(500).json({ success: false, error: "Error interno" });
  }
};

// =======================
// CAMBIAR ESTADO
// =======================
const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { estado } = req.body;
    const { id } = req.params;

    await db.query("UPDATE usuarios SET estado=? WHERE id_usuario=?", [
      estado,
      id,
    ]);

    res.json({ msg: "Estado actualizado" });
  } catch (err) {
    console.error("Error cambiando estado:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// =======================
// CAMBIAR ROL
// =======================
const cambiarRolUsuario = async (req, res) => {
  try {
    const { tipo } = req.body;
    const { id } = req.params;

    await db.query("UPDATE usuarios SET tipo=? WHERE id_usuario=?", [tipo, id]);

    res.json({ msg: "Rol actualizado" });
  } catch (err) {
    console.error("Error cambiando rol:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// =======================
// ELIMINAR USUARIO
// =======================
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const [[user]] = await db.query(
      "SELECT tipo FROM usuarios WHERE id_usuario=?",
      [id]
    );

    if (user.tipo === "admin") {
      return res
        .status(403)
        .json({ error: "No se puede eliminar al administrador" });
    }

    await db.query("DELETE FROM usuarios WHERE id_usuario=?", [id]);

    res.json({ msg: "Usuario eliminado" });
  } catch (err) {
    console.error("Error eliminando usuario:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

// =======================
// OBTENER TODAS LAS RESIDENCIAS
// =======================
const getAllResidences = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM propiedades");
    return rows;
  } catch (err) {
    console.error("Error obteniendo residencias:", err);
    throw err;
  }
};
const countUsuariosPorMes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        MONTH(fecha_registro) AS mes,
        COUNT(*) AS total
      FROM usuarios
      GROUP BY MONTH(fecha_registro)
      ORDER BY mes
    `);

    // Crear arreglo de 12 meses inicializados en 0
    const meses = Array(12).fill(0);

    rows.forEach((r) => {
      meses[r.mes - 1] = r.total; // mes 1 = Enero = índice 0
    });

    res.json(meses);
  } catch (error) {
    console.error("Error usuarios por mes:", error);
    res.status(500).json({ error: "Error interno" });
  }
};
const getResidencesOnly = async () => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM propiedades WHERE LOWER(tipo_arriendo) = 'residencia'"
    );
    return rows;
  } catch (err) {
    console.error("Error obteniendo solo residencias:", err);
    throw err;
  }
};

// =========================================
// EXPORTAR TODO CORRECTAMENTE
// =========================================
module.exports = {
  countUsuarios,
  countPropiedades,
  countArriendos,
  getUsuarios,
  updateUsuario,
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  eliminarUsuario,
  getAllResidences,
  countUsuariosPorMes,
  getResidencesOnly,
};
