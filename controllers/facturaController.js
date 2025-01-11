const db = require("../config/db"); // Conexión a la base de datos

// Crear una factura
const crearFactura = async (req, res) => {
  const { id_usuario, id_cliente, detalles, total, efectivo, cambio } =
    req.body;

  // Asignar Consumidor Final si no hay id_cliente
  const clienteId = id_cliente || 1; // ID del cliente "Consumidor Final"

  // Iniciar una transacción
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Insertar factura
    const [facturaResult] = await connection.query(
      `INSERT INTO facturas (id_usuario, id_cliente, total, efectivo, cambio)
             VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, clienteId, total, efectivo, cambio]
    );

    const id_factura = facturaResult.insertId;

    // Iterar sobre los detalles de la factura
    for (const detalle of detalles) {
      const { id_producto, cantidad, precio_unitario, subtotal } = detalle;

      // Verificar si el producto tiene suficiente stock
      const [producto] = await connection.query(
        `SELECT cantidad FROM productos WHERE id_producto = ?`,
        [id_producto]
      );

      if (producto.length === 0) {
        await connection.rollback();
        connection.release();
        return res
          .status(400)
          .json({ success: false, message: "Producto no encontrado." });
      }

      if (producto[0].cantidad <= 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `El producto con ID ${id_producto} está agotado.`,
        });
      }

      if (producto[0].cantidad < cantidad) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `No hay suficiente stock para el producto con ID ${id_producto}.`,
        });
      }

      // Insertar detalle de la factura
      await connection.query(
        `INSERT INTO detalles_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
        [id_factura, id_producto, cantidad, precio_unitario, subtotal]
      );

      // Actualizar stock del producto
      await connection.query(
        `UPDATE productos SET cantidad = cantidad - ? WHERE id_producto = ?`,
        [cantidad, id_producto]
      );
    }

    // Confirmar transacción
    await connection.commit();
    connection.release();

    res
      .status(200)
      .json({ success: true, message: "Factura procesada con éxito." });
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    connection.release();

    console.error(error);
    res.status(500).json({ message: "Error al crear la factura", error });
  }
};

module.exports = { crearFactura };
