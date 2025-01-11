const db = require("../config/db");

const User = {
  findByEmail: async (email) => {
    try {
      const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
        email,
      ]);
      return rows[0]; // Devuelve el primer resultado o undefined si no hay coincidencias
    } catch (error) {
      console.error("Error al buscar el usuario por email:", error);
      throw error;
    }
  },

  create: async (nombre, email, password, rol) => {
    try {
      const [result] = await db.query(
        "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
        [nombre, email, password, rol]
      );
      return result.insertId; // Devuelve el ID del nuevo usuario
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM usuarios WHERE id_usuario = ?",
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error al buscar el usuario por ID:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const fields = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(data);

      const [result] = await db.query(
        `UPDATE usuarios SET ${fields} WHERE id_usuario = ?`,
        [...values, id]
      );
      return result.affectedRows > 0; // Devuelve true si se actualizó alguna fila
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const [result] = await db.query(
        "DELETE FROM usuarios WHERE id_usuario = ?",
        [id]
      );
      return result.affectedRows > 0; // Devuelve true si se eliminó alguna fila
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM usuarios");
      return rows;
    } catch (error) {
      console.error("Error al obtener todos los usuarios:", error);
      throw error;
    }
  },
};

module.exports = User;
