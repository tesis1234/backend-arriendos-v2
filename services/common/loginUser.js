const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function loginUser({ email, password }) {
  console.log("📩 BODY:", email);
  console.log("👤 USERS:", users);
  console.log("🔑 HASH DB:", user?.password);
  try {
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (users.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const user = users[0];

    // BLOQUEAR USUARIOS INACTIVOS
    if (user.estado === "inactivo") {
      return {
        success: false,
        message: "Tu cuenta está inactiva. Contacta al administrador."
      };
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Contraseña incorrecta');
    }

    // Crear token de acceso
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '1d' }
    );

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id_usuario,
        email: user.email,
        tipo: user.tipo,
        nombres: user.nombres,
        apellidos: user.apellidos
      }
    };

  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    return {
      success: false,
      message: error?.message || "Error interno en login",
    };
  }

}

module.exports = { loginUser };
