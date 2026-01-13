require("dotenv").config();
const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/auth.routes");
const path = require("path");
const bancoRoutes = require("./routes/bancoRoutes");
const notificationRoutes = require("./routes/notifications");
const solicitudesRoutes = require("./routes/solicitudes");
const arriendosRoutes = require("./routes/arriendos");
const adminRoutes = require("./routes/admin.routes");

const axios = require("axios");

const PORT = process.env.PORT  || 8080;

app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// RUTAS
app.use("/api/arriendos", arriendosRoutes);
app.use("/api/bancos", bancoRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", solicitudesRoutes);
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ⭐ RUTA NUEVA DEL ADMINISTRADOR
app.use("/api/admin", adminRoutes);

app.get("/geocode", async (req, res) => {
  try {
    const q = req.query.q;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&countrycodes=ec&limit=10&addressdetails=1`;

    const response = await axios.get(url, {
      headers: { "User-Agent": "TuApp/1.0" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error en /geocode:", error.message);
    res.status(500).json({ error: "Error buscando dirección" });
  }
});

app.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    const response = await axios.get(url, {
      headers: { "User-Agent": "TuApp/1.0" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error en /reverse-geocode:", error.message);
    res.status(500).json({ error: "Error obteniendo dirección" });
  }
});
app.get("/", (req, res) => {
  res.status(200).send("Backend Arriendos OK 🚀");
});


app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT 1");
    res.json({
      db: "OK",
      rows
    });
  } catch (err) {
    console.error("TEST DB ERROR FULL:", err);
    res.status(500).json({
      db: "ERROR",
      error: err || "UNKNOWN_ERROR"
    });
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
