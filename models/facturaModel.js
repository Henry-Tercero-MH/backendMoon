const db = require("../config/db");

// Crear una nueva factura
const create = async (
  cliente_id,
  productos,
  total,
  efectivo,
  cambio,
  id_usuario
) => {
  try {
    // Inserta la factura en la tabla 'facturas'
    const query = `
      INSERT INTO facturas (id_cliente, total, efectivo, cambio, id_usuario, fecha)
      VALUES (?, ?, ?, ?, ?, NOW());
    `;
    const [result] = await db.execute(query, [
      cliente_id,
      total,
      efectivo,
      cambio,
      id_usuario,
    ]);

    // Obtener el ID de la factura recién creada
    const facturaId = result.insertId;

    // Registrar los productos en detalles_factura
    const queryDetalle = `
      INSERT INTO detalles_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal)
      VALUES ?
    `;
    const detalleValues = productos.map((producto) => [
      facturaId,
      producto.id_producto,
      producto.cantidad,
      producto.precio_unitario,
      producto.cantidad * producto.precio_unitario,
    ]);

    await db.execute(queryDetalle, [detalleValues]);

    return facturaId;
  } catch (error) {
    console.error("Error al crear la factura:", error);
    throw error;
  }
};

// Obtener todas las facturas
const getAll = async () => {
  try {
    const query = "SELECT * FROM facturas";
    const [result] = await db.execute(query);
    return result;
  } catch (error) {
    console.error("Error al obtener las facturas:", error);
    throw error;
  }
};

// Obtener factura por ID
const getById = async (id) => {
  try {
    const query = "SELECT * FROM facturas WHERE id_factura = ?";
    const [result] = await db.execute(query, [id]);
    if (result.length === 0) return null;

    // Obtener los detalles de la factura
    const queryDetalles = "SELECT * FROM detalles_factura WHERE id_factura = ?";
    const [detalles] = await db.execute(queryDetalles, [id]);

    return { ...result[0], detalles };
  } catch (error) {
    console.error("Error al obtener la factura:", error);
    throw error;
  }
};

// Eliminar una factura por ID del cliente
const deleteByClientId = async (clientId) => {
  try {
    // Primero, eliminar los detalles de las facturas asociadas al cliente
    const queryDetalles = `
      DELETE df FROM detalles_factura df
      JOIN facturas f ON df.id_factura = f.id_factura
      WHERE f.id_cliente = ?
    `;
    await db.execute(queryDetalles, [clientId]);

    // Luego, eliminar las facturas asociadas al cliente
    const queryFacturas = "DELETE FROM facturas WHERE id_cliente = ?";
    const [result] = await db.execute(queryFacturas, [clientId]);

    return result;
  } catch (error) {
    console.error("Error al eliminar la factura por ID del cliente:", error);
    throw error;
  }
};

// Actualizar una factura
const update = async (id, productos, total, efectivo, cambio) => {
  try {
    // Actualizar la factura
    const query = `
      UPDATE facturas
      SET total = ?, efectivo = ?, cambio = ?, fecha = NOW()
      WHERE id_factura = ?;
    `;
    const [result] = await db.execute(query, [total, efectivo, cambio, id]);

    // Actualizar los detalles de la factura
    const queryDetalle = `
      INSERT INTO detalles_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      cantidad = ?, precio_unitario = ?, subtotal = ?;
    `;
    for (let producto of productos) {
      const { id_producto, cantidad, precio_unitario } = producto;
      const subtotal = cantidad * precio_unitario;

      await db.execute(queryDetalle, [
        id,
        id_producto,
        cantidad,
        precio_unitario,
        subtotal,
        cantidad,
        precio_unitario,
        subtotal,
      ]);
    }

    return result;
  } catch (error) {
    console.error("Error al actualizar la factura:", error);
    throw error;
  }
};

module.exports = {
  create,
  getAll,
  getById,
  deleteByClientId,
  update,
};
