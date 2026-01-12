const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "../data/bancos.json");

  try {
    const data = fs.readFileSync(filePath, "utf8");
    const bancos = JSON.parse(data);
    res.json(bancos);
  } catch (error) {
    console.error("Error al leer bancos.json:", error);
    res.status(500).json({ message: "Error al cargar la lista de bancos" });
  }
});

module.exports = router;
