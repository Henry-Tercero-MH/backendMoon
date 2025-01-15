const db = require("../config/db");

// Función para obtener las ventas y ganancias del día actual
const obtenerVentasDelDia = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT SUM(ventas_totales) AS totalVentas, SUM(ganancia_total) AS totalGanancia 
                   FROM resumen_diario 
                   WHERE fecha = CURDATE()`;
    db.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0]);
    });
  });
};

// Función para obtener las ventas y ganancias de la semana actual
const obtenerVentasPorSemana = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT SUM(ventas_totales) AS totalVentas, SUM(ganancia_total) AS totalGanancia 
                   FROM resumen_diario 
                   WHERE YEARWEEK(fecha, 1) = YEARWEEK(CURDATE(), 1)`;
    db.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0]);
    });
  });
};

// Función para obtener las ventas y ganancias del mes actual
const obtenerVentasPorMes = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT SUM(ventas_totales) AS totalVentas, SUM(ganancia_total) AS totalGanancia 
                   FROM resumen_diario 
                   WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())`;
    db.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0]);
    });
  });
};

// Función para obtener los productos más vendidos en un rango de fechas
const obtenerProductosMasVendidos = (fechaInicio, fechaFin) => {
  return new Promise((resolve, reject) => {
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
    db.query(query, [fechaInicio, fechaFin], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

module.exports = {
  obtenerVentasDelDia,
  obtenerVentasPorSemana,
  obtenerVentasPorMes,
  obtenerProductosMasVendidos,
};
