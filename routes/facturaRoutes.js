const express = require("express");
const router = express.Router();
const FacturaController = require("../controllers/facturaController");

router.post("/", FacturaController.crearFactura);
router.get("/", FacturaController.getAll);
router.get("/:id", FacturaController.getById);
router.delete("/cliente/:clientId", FacturaController.deleteByClientId);
router.put("/:id", FacturaController.update);

module.exports = router;
