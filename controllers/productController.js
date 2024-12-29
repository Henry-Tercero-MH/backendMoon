const Product = require("../models/productModel");
const moment = require("moment"); // Asegúrate de tener instalada la librería moment para manejar fechas

const ProductController = {
  // Método para crear un producto
  create: async (req, res) => {
    const {
      nombre_producto,
      descripcion,
      codigo_barras,
      categoria,
      cantidad,
      precio_unitario,
      precio_venta,
      fecha_vencimiento,
    } = req.body;

    try {
      if (
        !nombre_producto ||
        !codigo_barras ||
        !categoria ||
        precio_unitario == null ||
        precio_venta == null
      ) {
        return res
          .status(400)
          .json({ message: "Faltan campos obligatorios para el producto." });
      }

      const categoriasValidas = [
        "bebidas",
        "granos básicos",
        "golosinas",
        "lácteos",
        "pastas",
      ];
      if (!categoriasValidas.includes(categoria)) {
        return res.status(400).json({
          message:
            "La categoría no es válida. Categorías válidas: " +
            categoriasValidas.join(", "),
        });
      }

      const productId = await Product.create(
        nombre_producto,
        descripcion,
        codigo_barras,
        categoria,
        cantidad || 0,
        precio_unitario,
        precio_venta,
        fecha_vencimiento || null
      );

      res.status(201).json({
        message: "Producto registrado exitosamente.",
        productId,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "El código de barras ya está registrado.",
        });
      }
      res.status(500).json({
        message: "Error en el servidor al registrar el producto.",
        error,
      });
    }
  },

  // Método para obtener todos los productos
  getAll: async (req, res) => {
    try {
      const productos = await Product.getAll(); // Método definido en el modelo
      const productosConAlerta = productos.map((producto) => {
        const fechaVencimiento = moment(
          producto.fecha_vencimiento,
          "YYYY-MM-DD"
        );
        const diasRestantes = fechaVencimiento.diff(moment(), "days");

        // Marcar productos que estén a 10 días o menos de su vencimiento
        if (diasRestantes <= 10) {
          producto.alertaVencimiento = true; // Agregar una propiedad para la alerta
        } else {
          producto.alertaVencimiento = false;
        }

        return producto;
      });

      res.status(200).json(productosConAlerta);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({
        message: "Error en el servidor al obtener los productos.",
        error,
      });
    }
  },

  // Método para eliminar un producto
  delete: async (req, res) => {
    const { codigo_barras } = req.params; // Suponiendo que pasas el código de barras como parámetro

    try {
      // Verificar que el código de barras haya sido proporcionado
      if (!codigo_barras) {
        return res.status(400).json({
          message:
            "El código de barras es obligatorio para eliminar el producto.",
        });
      }

      // Intentar eliminar el producto de la base de datos
      const productoEliminado = await Product.delete(codigo_barras); // Aquí llamas a tu método delete en el modelo

      if (!productoEliminado) {
        return res.status(404).json({
          message: "Producto no encontrado con ese código de barras.",
        });
      }

      res.status(200).json({
        message: "Producto eliminado exitosamente.",
        codigo_barras,
      });
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      res.status(500).json({
        message: "Error en el servidor al eliminar el producto.",
        error,
      });
    }
  },
};

module.exports = ProductController;
