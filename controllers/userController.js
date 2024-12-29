const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const UserController = {
  register: async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    try {
      // Validar entrada (puedes usar express-validator o Joi)
      if (!nombre || !email || !password) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      // Verifica si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "El correo ya está registrado" });
      }

      // Cifra la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crea el usuario
      const userId = await User.create(
        nombre,
        email,
        hashedPassword,
        rol || "empleado"
      );
      res.status(201).json({ message: "Usuario creado exitosamente", userId });
    } catch (error) {
      console.error(error); // Registra el error para depuración
      res.status(500).json({ message: "Error en el servidor" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Validar entrada
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios" });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Verifica la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Genera un token
      const token = jwt.sign(
        { id: user.id_usuario, rol: user.rol },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({ message: "Inicio de sesión exitoso", token });
    } catch (error) {
      console.error(error); // Registra el error para depuración
      res.status(500).json({ message: "Error en el servidor" });
    }
  },
};

module.exports = UserController;
