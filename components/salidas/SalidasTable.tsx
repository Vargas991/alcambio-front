'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiEdit3,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';

import { api } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/formatters';
import type { Salida } from '@/types/salidas';

type SalidasTableProps = {
  salidas: Salida[];
  onCreate: () => void;
  onEdit: (salida: Salida) => void;
};

function getTipoLabel(tipo: Salida['tipo']) {
  const labels: Record<Salida['tipo'], string> = {
    PAGO_ACREEDOR: 'Pago a acreedor',
    GASTO: 'Gasto',
    RETIRO: 'Retiro',
  };

  return labels[tipo] ?? tipo;
}

function getDestino(salida: Salida) {
  if (salida.tipo === 'PAGO_ACREEDOR') {
    return salida.acreedor?.nombre ?? 'Sin acreedor';
  }

  return salida.descripcion ?? '-';
}

function getImpuestoProveedor(salida: Salida) {
  if (salida.tipo !== 'PAGO_ACREEDOR') {
    return '-';
  }

  return formatMoney(
    salida.impuestoProveedor4x1000Cop ?? 0,
  );
}

function getImpuestoCuenta(salida: Salida) {
  return formatMoney(
    salida.impuestoCuenta4x1000Cop ?? 0,
  );
}

function getTotalDebitado(salida: Salida) {
  return formatMoney(
    salida.totalDebitadoCop ??
      salida.montoCop,
  );
}

export function SalidasTable({
  salidas,
  onCreate,
  onEdit,
}: SalidasTableProps) {
  const router = useRouter();

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  async function handleEliminar(
    salida: Salida,
  ) {
    const confirmed = window.confirm(
      [
        '¿Eliminar esta salida?',
        '',
        `Tipo: ${getTipoLabel(salida.tipo)}`,
        `Cuenta: ${salida.cuenta?.nombre ?? 'Sin cuenta'}`,
        `Monto base: ${formatMoney(
          salida.montoBaseCop ??
            salida.montoCop,
        )}`,
        `Total debitado: ${getTotalDebitado(
          salida,
        )}`,
        '',
        'Esta acción revertirá los movimientos y saldos generados por la salida.',
      ].join('\n'),
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingId(salida.id);

      await api.delete(
        `/salidas/${salida.id}`,
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        'No fue posible eliminar la salida.',
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Historial de salidas
          </h2>

          <p className="text-sm text-gray-500">
            Pagos, gastos y retiros registrados en cuentas propias.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlus className="h-4 w-4" />
          Nueva salida
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1300px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Tipo
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Cuenta
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Destino
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto base
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                4x1000 proveedor
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                4x1000 cuenta
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Total debitado
              </th>

              <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-400">
                Estado
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {salidas.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No hay salidas registradas.
                </td>
              </tr>
            ) : (
              salidas.map((salida) => {
                const loading =
                  loadingId === salida.id;

                return (
                  <tr
                    key={salida.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(
                        salida.creadoEn,
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                        {getTipoLabel(
                          salida.tipo,
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {salida.cuenta?.nombre ??
                        'Sin cuenta'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getDestino(salida)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {formatMoney(
                        salida.montoBaseCop ??
                          salida.montoCop,
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {getImpuestoProveedor(
                        salida,
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {getImpuestoCuenta(
                        salida,
                      )}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {getTotalDebitado(
                        salida,
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={[
                          'rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                          salida.estado ===
                          'REGISTRADA'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-red-50 text-red-700 ring-red-600/20',
                        ].join(' ')}
                      >
                        {salida.estado ===
                        'REGISTRADA'
                          ? 'Registrada'
                          : 'Cancelada'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {salida.estado ===
                          'REGISTRADA' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onEdit(salida)
                              }
                              disabled={loading}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                              title="Editar salida"
                            >
                              <FiEdit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEliminar(
                                  salida,
                                )
                              }
                              disabled={loading}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              title="Eliminar salida"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}