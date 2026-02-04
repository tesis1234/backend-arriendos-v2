const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function loginUser({ email, password }) {
  try {
    console.log('📩 LOGIN BODY:', { email, password });

    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    console.log('📦 RESULTADO QUERY:', users);

    if (users.length === 0) {
      console.log('❌ USUARIO NO ENCONTRADO');
      throw new Error('Usuario no encontrado');
    }

    const user = users[0];
    console.log('👤 USER:', user);

    // BLOQUEAR USUARIOS INACTIVOS
    console.log('🧩 ESTADO USUARIO:', user.estado);
    if (user.estado === "inactivo") {
      return {
        success: false,
        message: "Tu cuenta está inactiva. Contacta al administrador."
      };
    }

    console.log('🔐 PASSWORD ENVIADA:', password);
    console.log('🔐 HASH BD:', user.password);

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('✅ RESULTADO BCRYPT:', passwordMatch);

    if (!passwordMatch) {
      throw new Error('Contraseña incorrecta');
    }

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
    console.error('🔥 ERROR LOGIN:', error.message);
    return { success: false, message: error.message };
  }
}
