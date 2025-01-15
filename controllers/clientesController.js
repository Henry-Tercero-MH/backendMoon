const Cliente = require("../models/clienteModel");
const db = require("../config/db");

const ClienteController = {
  create: async (req, res) => {
    const { nombre, telefono, credito, descripcion_credito, dpi, nit, abonos } =
      req.body;

    try {
      const clienteId = await Cliente.create(
        nombre,
        telefono,
        credito,
        descripcion_credito,
        dpi,
        nit,
        abonos
      );
      res
        .status(201)
        .json({ message: "Cliente creado exitosamente", clienteId });
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      res
        .status(500)
        .json({ message: "Error en el servidor al crear el cliente", error });
    }
  },

  getAll: async (req, res) => {
    try {
      const clientes = await Cliente.getAll();
      res.status(200).json(clientes);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
      res.status(500).json({
        message: "Error en el servidor al obtener los clientes",
        error,
      });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;

    try {
      const cliente = await Cliente.getById(id);
      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.status(200).json(cliente);
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
      res
        .status(500)
        .json({ message: "Error en el servidor al obtener el cliente", error });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
      const updated = await Cliente.update(id, data);
      if (!updated) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.status(200).json({ message: "Cliente actualizado exitosamente" });
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      res.status(500).json({
        message: "Error en el servidor al actualizar el cliente",
        error,
      });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;

    try {
      const deleted = await Cliente.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.status(200).json({ message: "Cliente eliminado exitosamente" });
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      res.status(500).json({
        message: "Error en el servidor al eliminar el cliente",
        error,
      });
    }
  },

  getDetalleFactura: async (req, res) => {
    const { id } = req.params;
    const query = `
      SELECT c.nombre, p.nombre_producto, df.cantidad, p.precio_venta, 
             (df.cantidad * p.precio_venta) as precio_total
      FROM clientes c
      JOIN facturas f ON c.id_cliente = f.id_cliente
      JOIN detalles_factura df ON f.id_factura = df.id_factura
      JOIN productos p ON df.id_producto = p.id_producto
      WHERE c.id_cliente = ?
    `;

    try {
      const [results] = await db.query(query, [id]);
      if (results.length === 0) {
        return res.status(404).json({
          message: "No se encontraron detalles de factura para este cliente",
        });
      }

      const totalFactura = results.reduce(
        (total, item) => total + parseFloat(item.precio_total),
        0
      );
      const totalConInteres = totalFactura * 1.15;

      res.status(200).json({
        detalles: results,
        totalFactura: totalFactura.toFixed(2),
        totalConInteres: totalConInteres.toFixed(2),
      });
    } catch (error) {
      console.error("Error al obtener los detalles de la factura:", error);
      res.status(500).json({
        message: "Error en el servidor al obtener los detalles de la factura",
        error,
      });
    }
  },
  getFacturaCredito: async (req, res) => {
    const { id } = req.params;
    const query = `
    SELECT c.nombre, c.abonos, p.nombre_producto, df.cantidad, p.precio_venta, 
           (df.cantidad * p.precio_venta) as precio_total
    FROM clientes c
    JOIN facturas f ON c.id_cliente = f.id_cliente
    JOIN detalles_factura df ON f.id_factura = df.id_factura
    JOIN productos p ON df.id_producto = p.id_producto
    WHERE c.id_cliente = ? AND c.credito > 0;
  `;

    try {
      const [results] = await db.query(query, [id]);
      if (results.length === 0) {
        return res.status(404).json({
          message:
            "No se encontraron productos comprados a crédito para este cliente",
        });
      }

      const totalFactura = results.reduce(
        (total, item) => total + parseFloat(item.precio_total),
        0
      );
      const totalConInteres = totalFactura * 1.15;
      const abonos = parseFloat(results[0].abonos) || 0; // Asegúrate de que abonos sea un número
      const totalConAbono = totalConInteres - abonos;

      res.status(200).json({
        detalles: results,
        totalFactura: totalFactura.toFixed(2),
        totalConInteres: totalConInteres.toFixed(2),
        abonos: abonos.toFixed(2),
        totalConAbono: totalConAbono.toFixed(2),
      });
    } catch (error) {
      console.error(
        "Error al obtener los productos comprados a crédito:",
        error
      );
      res.status(500).json({
        message:
          "Error en el servidor al obtener los productos comprados a crédito",
        error,
      });
    }
  },
};

module.exports = ClienteController;
