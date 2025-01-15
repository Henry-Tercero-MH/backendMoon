const db = require("../config/db");
const Factura = require("../models/facturaModel");

const FacturaController = {
  crearFactura: async (req, res) => {
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
  },

  deleteByClientId: async (req, res) => {
    const { clientId } = req.params;

    try {
      const result = await Factura.deleteByClientId(clientId);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "No se encontraron facturas para este cliente" });
      }
      res.status(200).json({ message: "Factura(s) eliminada(s) exitosamente" });
    } catch (error) {
      console.error("Error al eliminar la factura por ID del cliente:", error);
      res
        .status(500)
        .json({
          message: "Error en el servidor al eliminar la factura",
          error,
        });
    }
  },

  getAll: async (req, res) => {
    try {
      const facturas = await Factura.getAll();
      res.status(200).json(facturas);
    } catch (error) {
      console.error("Error al obtener las facturas:", error);
      res
        .status(500)
        .json({
          message: "Error en el servidor al obtener las facturas",
          error,
        });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;

    try {
      const factura = await Factura.getById(id);
      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }
      res.status(200).json(factura);
    } catch (error) {
      console.error("Error al obtener la factura:", error);
      res
        .status(500)
        .json({ message: "Error en el servidor al obtener la factura", error });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { productos, total, efectivo, cambio } = req.body;

    try {
      const updated = await Factura.update(
        id,
        productos,
        total,
        efectivo,
        cambio
      );
      if (updated.affectedRows === 0) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }
      res.status(200).json({ message: "Factura actualizada exitosamente" });
    } catch (error) {
      console.error("Error al actualizar la factura:", error);
      res
        .status(500)
        .json({
          message: "Error en el servidor al actualizar la factura",
          error,
        });
    }
  },
};

module.exports = FacturaController;
