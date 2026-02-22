const bcrypt = require("bcrypt");
const pool = require("../../config/db");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);


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

const result = await resend.emails.send({
  from: "onboarding@resend.dev",
  to: "tesisarriendo@gmail.com",
  subject: "Prueba",
  html: "<h1>Prueba correo</h1>",
});

console.log("RESEND RESULT:", result);



    res.status(200).json({ message: "La contraseña temporal fue enviada a tu correo." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { handlePasswordReset };
