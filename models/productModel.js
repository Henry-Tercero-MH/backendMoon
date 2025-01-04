const db = require("../config/db");
const moment = require("moment");

const Product = {
  create: async (
    nombre_producto,
    descripcion,
    codigo_barras,
    categoria,
    cantidad,
    precio_unitario,
    precio_venta,
    fecha_vencimiento
  ) => {
    const [result] = await db.query(
      `INSERT INTO productos 
      (nombre_producto, descripcion, codigo_barras, categoria, cantidad, precio_unitario, precio_venta, fecha_vencimiento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_producto,
        descripcion,
        codigo_barras,
        categoria,
        cantidad,
        precio_unitario,
        precio_venta,
        fecha_vencimiento,
      ]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM productos");

    // Agregar la lógica para marcar productos con vencimiento cercano
    const productosConAlerta = rows.map((producto) => {
      const fechaVencimiento = moment(producto.fecha_vencimiento, "YYYY-MM-DD");
      const diasRestantes = fechaVencimiento.diff(moment(), "days");

      // Marcar productos que estén a 10 días o menos de su vencimiento
      if (diasRestantes <= 10) {
        producto.alertaVencimiento = true; // Agregar una propiedad para la alerta
      } else {
        producto.alertaVencimiento = false;
      }

      return producto;
    });

    return productosConAlerta;
  },

  // Método para eliminar un producto
  delete: async (codigo_barras) => {
    const [result] = await db.query(
      "DELETE FROM productos WHERE codigo_barras = ?",
      [codigo_barras]
    );
    return result; // Retorna el resultado de la eliminación (affectedRows)
  },

  // Método para eliminar un producto
  delete: async (codigo_barras) => {
    const [result] = await db.query(
      "DELETE FROM productos WHERE codigo_barras = ?",
      [codigo_barras]
    );
    return result; // Retorna el resultado de la eliminación (affectedRows)
  },

  // Método para actualizar un producto
  update: async (
    codigo_barras,
    nombre_producto,
    descripcion,
    categoria,
    cantidad,
    precio_unitario,
    precio_venta,
    fecha_vencimiento
  ) => {
    const query = `
    UPDATE productos 
    SET 
      nombre_producto = COALESCE(?, nombre_producto),
      descripcion = COALESCE(?, descripcion),
      categoria = COALESCE(?, categoria),
      cantidad = COALESCE(?, cantidad),
      precio_unitario = COALESCE(?, precio_unitario),
      precio_venta = COALESCE(?, precio_venta),
      fecha_vencimiento = COALESCE(?, fecha_vencimiento)
    WHERE codigo_barras = ?`;

    const [result] = await db.query(query, [
      nombre_producto,
      descripcion,
      categoria,
      cantidad,
      precio_unitario,
      precio_venta,
      fecha_vencimiento,
      codigo_barras,
    ]);
    return result;
  },
};

module.exports = Product;
