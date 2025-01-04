const express = require("express");
const ProductController = require("../controllers/productController");
const { body } = require("express-validator");

const router = express.Router();

// Ruta para registrar un nuevo producto
router.post(
  "/create",
  [
    body("nombre_producto")
      .notEmpty()
      .withMessage("El nombre del producto es obligatorio."),
    body("codigo_barras")
      .notEmpty()
      .withMessage("El código de barras es obligatorio."),
    body("categoria").notEmpty().withMessage("La categoría es obligatoria."),
    body("precio_unitario")
      .isFloat({ gt: 0 })
      .withMessage("El precio unitario debe ser un número mayor a 0."),
    body("precio_venta")
      .isFloat({ gt: 0 })
      .withMessage("El precio de venta debe ser un número mayor a 0."),
  ],
  ProductController.create
);

// Ruta para obtener todos los productos
router.get("/", ProductController.getAll);
// Ruta para eliminar un producto
router.delete("/:codigo_barras", ProductController.delete);
// Ruta para actualizar un producto
router.put("/:codigo_barras", ProductController.update);

module.exports = router;
