const db = require("../config/db");

const getVentasTotales = async (req, res) => {
  const { periodo } = req.params;
  const { fechaInicio, fechaFin } = req.query;
  let query = "";

  switch (periodo) {
    case "dia":
      query = `SELECT DATE(fecha) as fecha, SUM(total) as ventas_totales, SUM((detalles_factura.precio_unitario - productos.precio_unitario) * detalles_factura.cantidad) as ganancia_total 
               FROM facturas 
               JOIN detalles_factura ON facturas.id_factura = detalles_factura.id_factura 
               JOIN productos ON detalles_factura.id_producto = productos.id_producto 
               WHERE DATE(fecha) = ?
               GROUP BY DATE(fecha)`;
      break;
    case "rango":
      query = `SELECT SUM(total) as ventas_totales, SUM((detalles_factura.precio_unitario - productos.precio_unitario) * detalles_factura.cantidad) as ganancia_total 
               FROM facturas 
               JOIN detalles_factura ON facturas.id_factura = detalles_factura.id_factura 
               JOIN productos ON detalles_factura.id_producto = productos.id_producto 
               WHERE DATE(fecha) BETWEEN ? AND ?`;
      break;
    default:
      return res.status(400).json({ message: "Periodo no válido" });
  }

  try {
    let results;
    if (periodo === "dia") {
      results = await db.query(query, [fechaInicio]);
    } else if (periodo === "rango") {
      results = await db.query(query, [fechaInicio, fechaFin]);
    }
    res.json(results[0] || []);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las ventas", error });
  }
};

const getProductosMasVendidos = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  const query = `
    SELECT productos.nombre_producto, SUM(detalles_factura.cantidad) as ventas 
    FROM detalles_factura 
    JOIN productos ON detalles_factura.id_producto = productos.id_producto 
    JOIN facturas ON detalles_factura.id_factura = facturas.id_factura 
    WHERE DATE(facturas.fecha) BETWEEN ? AND ?
    GROUP BY productos.nombre_producto 
    ORDER BY ventas DESC 
    LIMIT 10
  `;

  try {
    const [results] = await db.query(query, [fechaInicio, fechaFin]);
    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los productos más vendidos", error });
  }
};

module.exports = {
  getVentasTotales,
  getProductosMasVendidos,
};
