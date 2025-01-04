const express = require("express");
const { crearFactura } = require("../controllers/facturaController");
const router = express.Router();

router.post("/facturas", crearFactura);

module.exports = router;
