import { formatDate, formatMoney, formatNumber } from '@/lib/formatters';
import type { ClienteLedgerEntry } from '@/types/clientes';

type ClienteLedgerTableProps = {
  movimientos: ClienteLedgerEntry[];
  title?: string;
  description?: string;
};

function getValue(entry: ClienteLedgerEntry, keys: string[]) {
  for (const key of keys) {
    const value = entry[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return null;
}

function getDisplayDate(entry: ClienteLedgerEntry) {
  const rawDate = getValue(entry, [
    'fecha',
    'fechaMovimiento',
    'creadoEn',
    'fechaRegistro',
  ]);

  if (!rawDate) return '-';

  return formatDate(String(rawDate));
}

function getDisplayMovement(entry: ClienteLedgerEntry) {
  if (entry.tipo === 'OPERACION') {
    if (entry.operacion?.tipo === 'VENTA') return 'Operación · Venta';
    if (entry.operacion?.tipo === 'COMPRA') return 'Operación · Compra';
    if (entry.operacion?.tipo === 'OPERACION_DIRECTA') {
      return 'Operación · Directa';
    }

    return 'Operación';
  }

  if (entry.tipo === 'ABONO') {
    return 'Entrada · Abono';
  }

  if (entry.tipo === 'ABONO_DIRECTO') {
    return 'Entrada · Abono directo';
  }

  if (entry.tipo === 'PAGO') {
    return 'Salida · Pago';
  }

  if (entry.tipo === 'CANCELACION') {
    return 'Cancelación';
  }

  if (entry.tipo === 'AJUSTE') {
    return 'Ajuste';
  }

  return String(entry.tipo ?? 'Movimiento');
}

function getDisplayMovementClass(entry: ClienteLedgerEntry) {
  if (entry.tipo === 'CANCELACION') {
    return 'bg-red-50 text-red-700 ring-red-600/20';
  }

  if (entry.tipo === 'ABONO' || entry.tipo === 'ABONO_DIRECTO') {
    return 'bg-blue-50 text-blue-700 ring-blue-600/20';
  }

  if (entry.tipo === 'PAGO') {
    return 'bg-purple-50 text-purple-700 ring-purple-600/20';
  }

  if (entry.tipo === 'OPERACION') {
    if (entry.operacion?.tipo === 'VENTA') {
      return 'bg-green-50 text-green-700 ring-green-600/20';
    }

    if (entry.operacion?.tipo === 'COMPRA') {
      return 'bg-orange-50 text-orange-700 ring-orange-600/20';
    }

    return 'bg-sky-50 text-sky-700 ring-sky-600/20';
  }

  return 'bg-gray-50 text-gray-700 ring-gray-600/20';
}

function getDisplayReference(entry: ClienteLedgerEntry) {
  if (entry.operacion?.codigo) {
    return entry.operacion.codigo;
  }

  if (entry.entradaId) {
    return `Entrada ${entry.entradaId.slice(0, 8)}`;
  }

  if (entry.salidaId) {
    return `Salida ${entry.salidaId.slice(0, 8)}`;
  }

  return '-';
}

function getDisplayConcept(entry: ClienteLedgerEntry) {
  const concept = getValue(entry, [
    'concepto',
    'descripcion',
    'detalle',
    'notas',
  ]);

  const notasOperacion = entry.operacion?.notas ?? getValue(entry, ['notas', 'notasOperacion', 'descripcion']);
  
  const codigoOperacion =
    entry.operacion?.codigo ??
    getValue(entry, ['codigo', 'codigoOperacion', 'numeroOperacion']);


  const parts = [
    codigoOperacion ? String(codigoOperacion) : null,
    notasOperacion ? String(notasOperacion) : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'Sin concepto';
}

function getDisplayMoneda(entry: ClienteLedgerEntry) {
  const moneda = getValue(entry, [
    'moneda',
    'monedaTransaccion',
    'monedaMovimiento',
  ]);

  return moneda ? String(moneda) : '-';
}

function getDisplayMonto(entry: ClienteLedgerEntry) {
  const monto = getValue(entry, [
    'monto',
    'montoTransaccion',
    'montoMovimiento',
    'total',
  ]);

  if (monto === null) return '-';

  return formatNumber(String(monto));
}

function getDisplayTasa(entry: ClienteLedgerEntry) {
  if (entry.tipo !== 'OPERACION') {
    return '-';
  }

  const tipoOperacion = entry.operacion?.tipo;

  const tasaCompra =
    entry.operacion?.tasaCompra ?? getValue(entry, ['tc', 'tasaCompra']);

  const tasaVenta =
    entry.operacion?.tasaVenta ?? getValue(entry, ['tv', 'tasaVenta']);

  if (tipoOperacion === 'COMPRA') {
    return tasaCompra !== null && tasaCompra !== undefined
      ? `TC ${formatMoney(String(tasaCompra))}`
      : '-';
  }

  if (tipoOperacion === 'VENTA') {
    return tasaVenta !== null && tasaVenta !== undefined
      ? `TV ${formatMoney(String(tasaVenta))}`
      : '-';
  }

  if (tipoOperacion === 'OPERACION_DIRECTA') {
    const parts = [
      tasaCompra !== null && tasaCompra !== undefined
        ? `TC ${formatMoney(String(tasaCompra))}`
        : null,
      tasaVenta !== null && tasaVenta !== undefined
        ? `TV ${formatMoney(String(tasaVenta))}`
        : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : '-';
  }

  return '-';
}

function getDisplayDebito(entry: ClienteLedgerEntry) {
  const debito = getValue(entry, ['debitoCop', 'debito', 'debitoCOP']);

  if (debito === null || Number(debito) === 0) {
    return '-';
  }

  return formatMoney(String(debito));
}

function getDisplayCredito(entry: ClienteLedgerEntry) {
  const credito = getValue(entry, ['creditoCop', 'credito', 'creditoCOP']);

  if (credito === null || Number(credito) === 0) {
    return '-';
  }

  return formatMoney(String(credito));
}

function getDisplaySaldo(entry: ClienteLedgerEntry) {
  const saldo = getValue(entry, [
    'saldoAcumuladoCop',
    'saldo',
    'saldoCop',
    'saldoFinal',
    'balance',
  ]);

  if (saldo === null) return '-';

  return formatMoney(String(saldo));
}

function getSaldoClass(entry: ClienteLedgerEntry) {
  const saldo = getValue(entry, [
    'saldoAcumuladoCop',
    'saldo',
    'saldoCop',
    'saldoFinal',
    'balance',
  ]);

  const saldoNumber = Number(saldo ?? 0);

  if (saldoNumber > 0) return 'text-green-700';
  if (saldoNumber < 0) return 'text-red-700';

  return 'text-gray-900';
}

function getDisplayUtilidad(entry: ClienteLedgerEntry) {
  const utilidad = getValue(entry, [
    'utilidadRealCop',
    'utilidad',
    'utilidadCop',
  ]);

  if (utilidad === null || Number(utilidad) === 0) {
    return '-';
  }

  return formatMoney(String(utilidad));
}

function getDisplayImpuestos(entry: ClienteLedgerEntry) {
  if (!entry.salida) return '-';


  const impuestoCuenta = Number(entry.salida.impuestoCuenta4x1000Cop ?? 0);

  if (impuestoCuenta === 0) {
    return '-';
  }

  return impuestoCuenta > 0 ? formatMoney(impuestoCuenta) : "-";

}

export function ClienteLedgerTable({
  movimientos,
  title = 'Movimientos del cliente',
  description = 'Historial completo de operaciones, abonos, pagos, abonos directos y cancelaciones.',
}: ClienteLedgerTableProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>

        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Movimiento
              </th>


              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Concepto
              </th>

              {/* <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Moneda
              </th> */}

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Tasa
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Débito COP
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Crédito COP
              </th>

              {/* <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Utilidad
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                4x1000
              </th> */}

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Saldo
              </th>
            </tr>
          </thead>

          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <h3 className="text-lg font-medium text-gray-700">
                    No hay movimientos en el ledger.
                  </h3>
                </td>
              </tr>
            ) : (
              movimientos.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {getDisplayDate(entry)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={[
                        'inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                        getDisplayMovementClass(entry),
                      ].join(' ')}
                    >
                      {getDisplayMovement(entry)}
                    </span>
                  </td>

                  <td className="max-w-[380px] px-6 py-4 text-sm text-gray-600">
                    <span className="block truncate" title={getDisplayConcept(entry)}>
                      {getDisplayConcept(entry)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {getDisplayMonto(entry)} {getDisplayMoneda(entry)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {getDisplayTasa(entry)} 
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {getDisplayDebito(entry)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {getDisplayCredito(entry)}
                  </td>
{/* 
                  <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-700">
                    {getDisplayUtilidad(entry)}
                  </td>

                  <td className="max-w-[220px] px-6 py-4 text-sm text-gray-600">
                    <span className="block truncate" title={getDisplayImpuestos(entry)}>
                      {getDisplayImpuestos(entry)}
                    </span>
                  </td> */}

                  <td
                    className={[
                      'px-6 py-4 text-right text-sm font-bold',
                      getSaldoClass(entry),
                    ].join(' ')}
                  >
                    {getDisplaySaldo(entry)}
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