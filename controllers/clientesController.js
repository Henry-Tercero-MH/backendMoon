const Cliente = require("../models/clienteModel");

const ClienteController = {
  create: async (req, res) => {
    const { nombre, telefono, credito, descripcion_credito, dpi, nit } =
      req.body;

    try {
      const clienteId = await Cliente.create(
        nombre,
        telefono,
        credito,
        descripcion_credito,
        dpi,
        nit
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
      res
        .status(500)
        .json({
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
      res
        .status(500)
        .json({
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
      res
        .status(500)
        .json({
          message: "Error en el servidor al eliminar el cliente",
          error,
        });
    }
  },
};

module.exports = ClienteController;
