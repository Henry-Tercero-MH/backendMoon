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

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
