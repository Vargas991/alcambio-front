import { formatDate, formatMoney, formatNumber } from '@/lib/formatters';
import type { MovimientoCuenta } from '@/services/cuentas.server';

type CuentaMovimientosTableProps = {
  movimientos: MovimientoCuenta[];
};

function formatMonto(movimiento: MovimientoCuenta) {
  if (movimiento.moneda === 'COP') {
    return formatMoney(movimiento.monto);
  }

  return `${formatNumber(movimiento.monto)} ${movimiento.moneda}`;
}

function formatSaldo(movimiento: MovimientoCuenta, value: string) {
  if (movimiento.moneda === 'COP') {
    return formatMoney(value);
  }

  return `${formatNumber(value)} ${movimiento.moneda}`;
}

function getTipoClass(tipo: string) {
  if (
    tipo === 'ENTRADA' ||
    tipo === 'TRASLADO_ENTRADA' ||
    tipo === 'AJUSTE_ENTRADA' ||
    tipo === 'OPERACION_ENTRADA'
  ) {
    return 'bg-green-50 text-green-700 ring-green-600/20';
  }

  if (
    tipo === 'SALIDA' ||
    tipo === 'TRASLADO_SALIDA' ||
    tipo === 'AJUSTE_SALIDA' ||
    tipo === 'OPERACION_SALIDA' ||
    tipo === 'GASTO'
  ) {
    return 'bg-red-50 text-red-700 ring-red-600/20';
  }

  return 'bg-gray-50 text-gray-700 ring-gray-600/20';
}

function getTipoLabel(tipo: string) {
  const labels: Record<string, string> = {
    ENTRADA: 'Entrada',
    SALIDA: 'Salida',
    GASTO: 'Gasto',
    TRASLADO_ENTRADA: 'Traslado entrada',
    TRASLADO_SALIDA: 'Traslado salida',
    OPERACION_ENTRADA: 'Operación entrada',
    OPERACION_SALIDA: 'Operación salida',
    AJUSTE_ENTRADA: 'Ajuste entrada',
    AJUSTE_SALIDA: 'Ajuste salida',
  };

  return labels[tipo] ?? tipo;
}

export function CuentaMovimientosTable({
  movimientos,
}: CuentaMovimientosTableProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900">
          Movimientos de la cuenta
        </h2>

        <p className="text-sm text-gray-500">
          Entradas, salidas, traslados, gastos y ajustes de saldo.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Movimiento
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Descripción
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Saldo anterior
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Saldo nuevo
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Referencia
              </th>
            </tr>
          </thead>

          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No hay movimientos registrados para esta cuenta.
                </td>
              </tr>
            ) : (
              movimientos.map((movimiento) => (
                <tr
                  key={movimiento.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {formatDate(movimiento.creadoEn)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={[
                        'inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                        getTipoClass(movimiento.tipo),
                      ].join(' ')}
                    >
                      {getTipoLabel(movimiento.tipo)}
                    </span>
                  </td>

                  <td className="max-w-[320px] px-6 py-4 text-sm text-gray-600">
                    <span className="block truncate">
                      {movimiento.descripcion ?? '-'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {formatMonto(movimiento)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {formatSaldo(movimiento, movimiento.saldoAnterior)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {formatSaldo(movimiento, movimiento.saldoNuevo)}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {movimiento.referenciaTipo
                      ? `${movimiento.referenciaTipo} ${movimiento.referenciaId ?? ''}`
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}