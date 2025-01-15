const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/clientesController");

router.post("/", ClienteController.create);
router.get("/", ClienteController.getAll);
router.get("/:id", ClienteController.getById);
router.put("/:id", ClienteController.update);
router.delete("/:id", ClienteController.delete);
router.get("/:id/detalle-factura", ClienteController.getDetalleFactura);
router.get("/:id/factura-credito", ClienteController.getFacturaCredito);

module.exports = router;
