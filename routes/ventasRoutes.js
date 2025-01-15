const express = require("express");
const router = express.Router();
const {
  getVentasTotales,
  getProductosMasVendidos,
} = require("../controllers/ventasController");

router.get("/totales/:periodo", getVentasTotales);
router.get("/productos-mas-vendidos", getProductosMasVendidos);

module.exports = router;
