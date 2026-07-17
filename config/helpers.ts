import { Operacion } from '@/types/operaciones';

function buildOperacionesTotals(operaciones: Operacion[]) {
  const registradas = operaciones.filter(
    (operacion) => operacion.estado === 'REGISTRADA',
  );

  const canceladas = operaciones.filter(
    (operacion) => operacion.estado === 'CANCELADA',
  );

  const ventas = registradas.filter(
    (operacion) => operacion.tipo === 'VENTA',
  );

  const directas = registradas.filter(
    (operacion) => operacion.tipo === 'OPERACION_DIRECTA',
  );

  const compras = registradas.filter(
    (operacion) => operacion.tipo === 'COMPRA',
  );

  const totalMontoTransaccion = registradas.reduce(
    (total, operacion) => total + Number(operacion.montoTransaccion),
    0,
  );

  const totalCompraCop = registradas.reduce(
    (total, operacion) => total + Number(operacion.totalCompraCop),
    0,
  );

  const totalVentaCop = registradas.reduce(
    (total, operacion) => total + Number(operacion.totalVentaCop),
    0,
  );

  const utilidadRealCop = registradas.reduce((total, operacion) => {
    if (
      operacion.tipo !== 'VENTA' &&
      operacion.tipo !== 'OPERACION_DIRECTA'
    ) {
      return total;
    }

    return total + Number(operacion.utilidadCop);
  }, 0);

  return {
    cantidadTotal: operaciones.length,
    cantidadRegistradas: registradas.length,
    cantidadCanceladas: canceladas.length,
    cantidadVentas: ventas.length,
    cantidadDirectas: directas.length,
    cantidadCompras: compras.length,
    totalMontoTransaccion,
    totalCompraCop,
    totalVentaCop,
    utilidadRealCop,
  };
}