const bcrypt = require("bcrypt");
const pool = require("../../config/db"); 
const transporter = require("../../config/mailer");

function generateTemporaryPassword(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const handlePasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(200).json({ message: "Si el correo electrónico esta registrado recibiras instrucciones." });
    }

    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await pool.query(
      "UPDATE usuarios SET password = ?, password_temporal = TRUE WHERE email = ?",
      [hashedPassword, email]
    );

    await transporter.sendMail({
      from: `"Support - Arriendos" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Temporary Password",
      text: `Tu contraseña temporal es: ${tempPassword}\n\nPor favor, cambiala después de iniciar sesión.`,
    });

    res.status(200).json({ message: "La contraseña temporal fue enviada a tu correo." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { handlePasswordReset };
