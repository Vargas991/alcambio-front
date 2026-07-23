'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiEdit3,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';

import { api } from '@/lib/api';
import {
  formatDate,
  formatMoney,
} from '@/lib/formatters';

import type { Entrada } from '@/types/entradas';

type EntradasTableProps = {
  entradas: Entrada[];

  onCreate: () => void;

  /**
   * El padre abrirá el modal de edición.
   */
  onEdit: (entrada: Entrada) => void;
};

function getTipoLabel(tipo: Entrada['tipo']) {
  if (tipo === 'ABONO_CUENTA_PROPIA') {
    return 'Abono a cuenta propia';
  }

  return 'Abono directo a proveedor';
}

function getDestino(entrada: Entrada) {
  if (
    entrada.tipo === 'ABONO_CUENTA_PROPIA'
  ) {
    return entrada.cuenta?.nombre ?? 'Sin cuenta';
  }

  return (
    entrada.acreedor?.nombre ??
    'Sin acreedor'
  );
}

/**
 * Muestra el impuesto correspondiente
 * dependiendo del tipo de entrada.
 */
function getImpuesto(entrada: Entrada) {
  if (
    entrada.tipo === 'ABONO_CUENTA_PROPIA'
  ) {
    return formatMoney(
      entrada.impuesto4x1000Cop ?? 0,
    );
  }

  return formatMoney(
    entrada.impuestoProveedor4x1000Cop ?? 0,
  );
}

/**
 * Cuenta propia:
 * muestra cuánto se aplicó realmente a deuda.
 *
 * Directo proveedor:
 * muestra cuánto recibió realmente el acreedor.
 */
function getMontoAplicado(entrada: Entrada) {
  if (
    entrada.tipo === 'ABONO_CUENTA_PROPIA'
  ) {
    return formatMoney(
      entrada.montoAplicadoDeudaCop ??
        entrada.montoCop,
    );
  }

  return formatMoney(
    entrada.montoNetoAcreedorCop ??
      entrada.montoCop,
  );
}

function getMontoAplicadoLabel(
  entrada: Entrada,
) {
  if (
    entrada.tipo === 'ABONO_CUENTA_PROPIA'
  ) {
    return 'Aplicado a deuda';
  }

  return 'Neto acreedor';
}

export function EntradasTable({
  entradas,
  onCreate,
  onEdit,
}: EntradasTableProps) {
  const router = useRouter();

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  async function handleEliminar(
    entrada: Entrada,
  ) {
    const confirmed = window.confirm(
      [
        '¿Eliminar esta entrada?',
        '',
        `Deudor: ${
          entrada.deudor?.nombre ??
          'Sin deudor'
        }`,
        `Monto: ${formatMoney(
          entrada.montoCop,
        )}`,
        '',
        'Esta acción revertirá los movimientos generados por la entrada.',
      ].join('\n'),
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingId(entrada.id);

      await api.delete(
        `/entradas/${entrada.id}`,
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        'No fue posible eliminar la entrada.',
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Historial de entradas
          </h2>

          <p className="text-sm text-gray-500">
            Abonos recibidos y pagos directos
            realizados por clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlus className="h-4 w-4" />

          Nueva entrada
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Tipo
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Deudor
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Destino
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                4x1000
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Aplicado / Neto
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
            {entradas.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No hay entradas registradas.
                </td>
              </tr>
            ) : (
              entradas.map((entrada) => {
                const loading =
                  loadingId === entrada.id;

                return (
                  <tr
                    key={entrada.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    {/* FECHA */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(
                        entrada.creadoEn,
                      )}
                    </td>

                    {/* TIPO */}
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {getTipoLabel(
                          entrada.tipo,
                        )}
                      </span>
                    </td>

                    {/* DEUDOR */}
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {entrada.deudor?.nombre ??
                        'Sin deudor'}
                    </td>

                    {/* DESTINO */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getDestino(entrada)}
                    </td>

                    {/* MONTO */}
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {formatMoney(
                        entrada.montoCop,
                      )}
                    </td>

                    {/* 4X1000 */}
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {getImpuesto(entrada)}
                    </td>

                    {/* MONTO APLICADO */}
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {getMontoAplicado(
                          entrada,
                        )}
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {getMontoAplicadoLabel(
                          entrada,
                        )}
                      </p>
                    </td>

                    {/* ESTADO */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={[
                          'rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',

                          entrada.estado ===
                          'REGISTRADA'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-red-50 text-red-700 ring-red-600/20',
                        ].join(' ')}
                      >
                        {entrada.estado ===
                        'REGISTRADA'
                          ? 'Registrada'
                          : 'Cancelada'}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {entrada.estado ===
                          'REGISTRADA' && (
                          <>
                            {/* EDITAR */}
                            <button
                              type="button"
                              onClick={() =>
                                onEdit(
                                  entrada,
                                )
                              }
                              disabled={loading}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                              title="Editar entrada"
                            >
                              <FiEdit3 className="h-4 w-4" />
                            </button>

                            {/* ELIMINAR */}
                            <button
                              type="button"
                              onClick={() =>
                                handleEliminar(
                                  entrada,
                                )
                              }
                              disabled={loading}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              title="Eliminar entrada"
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