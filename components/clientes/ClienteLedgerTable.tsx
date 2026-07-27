import {
  formatDate,
  formatMoney,
  formatNumber,
} from '@/lib/formatters';

import type { ClienteLedgerEntry } from '@/types/clientes';

type ClienteLedgerTableProps = {
  movimientos: ClienteLedgerEntry[];
  title?: string;
  description?: string;
};

function getDisplayDate(
  entry: ClienteLedgerEntry,
) {
  return formatDate(entry.creadoEn);
}

function getDisplayMovement(
  entry: ClienteLedgerEntry,
) {
  if (entry.tipo === 'OPERACION') {
    if (
      entry.operacion?.tipo ===
      'VENTA'
    ) {
      return 'Operación · Venta';
    }

    if (
      entry.operacion?.tipo ===
      'COMPRA'
    ) {
      return 'Operación · Compra';
    }

    if (
      entry.operacion?.tipo ===
      'OPERACION_DIRECTA'
    ) {
      return 'Operación · Directa';
    }

    return 'Operación';
  }

  if (entry.tipo === 'ABONO') {
    return 'Entrada · Abono';
  }

  if (
    entry.tipo === 'ABONO_DIRECTO'
  ) {
    return 'Entrada · Abono directo';
  }

  if (entry.tipo === 'PAGO') {
    return 'Salida · Pago';
  }

  if (
    entry.tipo === 'CANCELACION'
  ) {
    return 'Cancelación';
  }

  if (entry.tipo === 'AJUSTE') {
    return 'Ajuste';
  }

  return entry.tipo ?? 'Movimiento';
}

function getDisplayMovementClass(
  entry: ClienteLedgerEntry,
) {
  if (
    entry.tipo === 'CANCELACION'
  ) {
    return 'bg-red-50 text-red-700 ring-red-600/20';
  }

  if (
    entry.tipo === 'ABONO' ||
    entry.tipo === 'ABONO_DIRECTO'
  ) {
    return 'bg-blue-50 text-blue-700 ring-blue-600/20';
  }

  if (entry.tipo === 'PAGO') {
    return 'bg-purple-50 text-purple-700 ring-purple-600/20';
  }

  if (entry.tipo === 'AJUSTE') {
    return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
  }

  if (
    entry.tipo === 'OPERACION'
  ) {
    if (
      entry.operacion?.tipo ===
      'VENTA'
    ) {
      return 'bg-green-50 text-green-700 ring-green-600/20';
    }

    if (
      entry.operacion?.tipo ===
      'COMPRA'
    ) {
      return 'bg-orange-50 text-orange-700 ring-orange-600/20';
    }

    if (
      entry.operacion?.tipo ===
      'OPERACION_DIRECTA'
    ) {
      return 'bg-sky-50 text-sky-700 ring-sky-600/20';
    }
  }

  return 'bg-gray-50 text-gray-700 ring-gray-600/20';
}

function getDisplayConcept(
  entry: ClienteLedgerEntry,
) {
  const codigo =
    entry.operacion?.codigo;

  const notas =
    entry.operacion?.notas ??
    entry.entrada?.notas ??
    entry.salida?.notas ??
    entry.entrada?.descripcion ??
    entry.salida?.descripcion ??
    entry.descripcion;

  const parts = [
    codigo || null,
    notas || null,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(' · ')
    : 'Sin concepto';
}

function getDisplayMoneda(
  entry: ClienteLedgerEntry,
) {
  return (
    entry.monedaTransaccion ??
    '-'
  );
}

function getDisplayMonto(
  entry: ClienteLedgerEntry,
) {
  if (
    entry.montoTransaccion ===
      null ||
    entry.montoTransaccion ===
      undefined
  ) {
    return '-';
  }

  return formatNumber(
    String(
      entry.montoTransaccion,
    ),
  );
}

function getDisplayTasa(
  entry: ClienteLedgerEntry,
) {
  if (
    entry.tipo !== 'OPERACION' ||
    !entry.operacion
  ) {
    return '-';
  }

  const tipoOperacion =
    entry.operacion.tipo;

  const tasaCompra =
    entry.operacion.tasaCompra;

  const tasaVenta =
    entry.operacion.tasaVenta;

  if (
    tipoOperacion === 'COMPRA'
  ) {
    return tasaCompra !== null &&
      tasaCompra !== undefined
      ? `TC ${formatNumber(
          String(tasaCompra),
        )}`
      : '-';
  }

  if (
    tipoOperacion === 'VENTA'
  ) {
    return tasaVenta !== null &&
      tasaVenta !== undefined
      ? `TV ${formatNumber(
          String(tasaVenta),
        )}`
      : '-';
  }

  if (
    tipoOperacion ===
    'OPERACION_DIRECTA'
  ) {
    const parts = [
      tasaCompra !== null &&
      tasaCompra !== undefined
        ? `TC ${formatNumber(
            String(tasaCompra),
          )}`
        : null,

      tasaVenta !== null &&
      tasaVenta !== undefined
        ? `TV ${formatNumber(
            String(tasaVenta),
          )}`
        : null,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(' · ')
      : '-';
  }

  return '-';
}

function getDisplayDebito(
  entry: ClienteLedgerEntry,
) {
  const debito = Number(
    entry.debitoCop ?? 0,
  );

  if (debito === 0) {
    return '-';
  }

  return formatMoney(debito);
}

function getDisplayCredito(
  entry: ClienteLedgerEntry,
) {
  const credito = Number(
    entry.creditoCop ?? 0,
  );

  if (credito === 0) {
    return '-';
  }

  return formatMoney(credito);
}

function getDisplaySaldo(
  entry: ClienteLedgerEntry,
) {
  if (
    entry.saldoAcumuladoCop ===
      undefined ||
    entry.saldoAcumuladoCop ===
      null
  ) {
    return '-';
  }

  return formatMoney(
    String(
      entry.saldoAcumuladoCop,
    ),
  );
}

function getSaldoClass(
  entry: ClienteLedgerEntry,
) {
  const saldo = Number(
    entry.saldoAcumuladoCop ??
      0,
  );

  if (saldo > 0) {
    return 'text-green-700';
  }

  if (saldo < 0) {
    return 'text-red-700';
  }

  return 'text-gray-900';
}

function getDisplayUtilidad(
  entry: ClienteLedgerEntry,
) {
  const utilidad = Number(
    entry.utilidadRealCop ?? 0,
  );

  if (utilidad === 0) {
    return '-';
  }

  return formatMoney(utilidad);
}

function getDisplayImpuestos(
  entry: ClienteLedgerEntry,
) {
  if (!entry.salida) {
    return '-';
  }

  const impuestoCuenta =
    Number(
      entry.salida
        .impuestoCuenta4x1000Cop ??
        0,
    );

  if (impuestoCuenta === 0) {
    return '-';
  }

  return formatMoney(
    impuestoCuenta,
  );
}

export function ClienteLedgerTable({
  movimientos,
  title = 'Movimientos del cliente',
  description = 'Historial completo de operaciones, abonos, pagos, abonos directos y cancelaciones.',
}: ClienteLedgerTableProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        <p className="text-sm text-gray-500">
          {description}
        </p>
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

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Saldo
              </th>
            </tr>
          </thead>

          <tbody>
            {movimientos.length ===
            0 ? (
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
              movimientos.map(
                (entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {getDisplayDate(
                        entry,
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={[
                          'inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                          getDisplayMovementClass(
                            entry,
                          ),
                        ].join(' ')}
                      >
                        {getDisplayMovement(
                          entry,
                        )}
                      </span>
                    </td>

                    <td className="max-w-[380px] px-6 py-4 text-sm text-gray-600">
                      <span
                        className="block truncate"
                        title={getDisplayConcept(
                          entry,
                        )}
                      >
                        {getDisplayConcept(
                          entry,
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {getDisplayMonto(
                        entry,
                      )}{' '}
                      {getDisplayMoneda(
                        entry,
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {getDisplayTasa(
                        entry,
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {getDisplayDebito(
                        entry,
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {getDisplayCredito(
                        entry,
                      )}
                    </td>

                    <td
                      className={[
                        'px-6 py-4 text-right text-sm font-bold',
                        getSaldoClass(
                          entry,
                        ),
                      ].join(' ')}
                    >
                      {getDisplaySaldo(
                        entry,
                      )}
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}