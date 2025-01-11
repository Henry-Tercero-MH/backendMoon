const db = require("../config/db");

const Cliente = {
  create: async (nombre, telefono, credito, descripcion_credito, dpi, nit) => {
    const [result] = await db.query(
      `INSERT INTO clientes (nombre, telefono, credito, descripcion_credito, dpi, nit)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, telefono, credito, descripcion_credito, dpi, nit]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM clientes");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query(
      "SELECT * FROM clientes WHERE id_cliente = ?",
      [id]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const fields = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(data);

    const [result] = await db.query(
      `UPDATE clientes SET ${fields} WHERE id_cliente = ?`,
      [...values, id]
    );
    return result.affectedRows > 0;
  },

  delete: async (id) => {
    const [result] = await db.query(
      "DELETE FROM clientes WHERE id_cliente = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Cliente;
