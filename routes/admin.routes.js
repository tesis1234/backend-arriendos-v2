const express = require("express");
const router = express.Router();
const adminService = require("../services/admin/adminService");
const adminController = require("../services/admin/adminService");
const db = require("../config/db");

// TOTAL DE USUARIOS
router.get("/usuarios/count", adminService.countUsuarios);

// RESIDENCIAS, DEPARTAMENTOS Y OCUPACIÓN
router.get("/propiedades/count", adminService.countPropiedades);

// CONTRATOS, ACTIVOS, INGRESOS
router.get("/arriendos/count", adminService.countArriendos);
router.get("/usuarios", adminService.getUsuarios);
router.put("/usuarios/:id", adminService.updateUsuario);
router.put("/usuarios/:id/estado", adminService.cambiarEstadoUsuario);
router.put("/usuarios/:id/rol", adminService.cambiarRolUsuario);
router.delete("/usuarios/:id", adminService.eliminarUsuario);

router.get("/usuarios/por-mes", adminController.countUsuariosPorMes);
router.get("/residences", async (req, res) => {
  try {
    const residencias = await adminController.getResidencesOnly();
    res.json(residencias);
  } catch (error) {
    console.error("Error en /admin/residences:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

router.get("/departments", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM propiedades WHERE LOWER(tipo_arriendo) = 'departamento'"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error cargando departamentos:", err);
    res.status(500).json({ error: "Error cargando departamentos" });
  }
});
module.exports = router;
