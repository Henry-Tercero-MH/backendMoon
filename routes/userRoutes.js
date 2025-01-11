const express = require("express");
const UserController = require("../controllers/userController");
const { body } = require("express-validator");
const router = express.Router();

// Validaciones y rutas
router.post(
  "/register",
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Correo inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("rol").notEmpty().withMessage("El rol es obligatorio"),
  ],
  UserController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Correo inválido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  UserController.login
);

// Agregar la ruta para obtener todos los usuarios
router.get("/", UserController.getAll);
// Agregar la ruta para eliminar un usuario
router.delete("/:id", UserController.delete);

module.exports = router;
