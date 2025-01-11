const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Rutas
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
// ruta productos
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);
//factura rutas
const facturaRoutes = require("./routes/facturaRoutes");
app.use("/api", facturaRoutes);
//ruta clientes
const clientesRoutes = require("./routes/clientesRoutes");
app.use("/api/clientes", clientesRoutes);

// // Middleware para manejar errores globales
app.use((err, req, res, next) => {
  console.error(err.stack); // Log del error en consola
  res.status(500).json({
    message: "Algo salió mal en el servidor.",
    error: err.message,
  });
});
// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
