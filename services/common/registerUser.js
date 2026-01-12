const bcrypt = require("bcrypt");
const db = require("../../config/db");

async function registerUser(userData) {
  const {
    cedula,
    nombres,
    apellidos,
    email,
    telefono,
    password,
    tipo,
    numero_cuenta,
    banco_preferido,
    tipo_documento,
    fecha_nacimiento,
  } = userData;
  console.log("Datos recibidos en backend:", userData);
  try {
    const [existing] = await db.query(
      "SELECT * FROM usuarios WHERE email = ? OR cedula = ?",
      [email, cedula]
    );
    if (existing.length > 0) {
      throw new Error("El usuario ya está registrado con ese correo o cédula.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO usuarios (cedula, nombres, apellidos, email, telefono, password, tipo, estado, tipo_documento, fecha_nacimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cedula,
        nombres,
        apellidos,
        email,
        telefono,
        hashedPassword,
        tipo,
        "pendiente",
        tipo_documento,
        fecha_nacimiento,
      ]
    );

    const userId = result.insertId;

    if (tipo === "propietario") {
      await db.query(
        `INSERT INTO propietarios (id_propietario, banco_preferido, numero_cuenta)
         VALUES (?, ?, ?)`,
        [userId, banco_preferido, numero_cuenta]
      );
    } else if (tipo === "estudiante") {
      await db.query(
        `INSERT INTO estudiantes (id_estudiante, banco_preferido, numero_cuenta)
     VALUES (?, ?, ?)`,
        [userId, banco_preferido, numero_cuenta]
      );
    }

    return { success: true, message: "Usuario registrado exitosamente." };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
}

module.exports = { registerUser };
