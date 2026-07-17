'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiXCircle } from 'react-icons/fi';

import { api } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/formatters';
import type { Entrada } from '@/types/entradas';

type EntradasTableProps = {
  entradas: Entrada[];
  onCreate: () => void;
};

function getTipoLabel(tipo: Entrada['tipo']) {
  if (tipo === 'ABONO_CUENTA_PROPIA') return 'Abono a cuenta propia';
  return 'Abono directo a proveedor';
}

function getDestino(entrada: Entrada) {
  if (entrada.tipo === 'ABONO_CUENTA_PROPIA') {
    return entrada.cuenta?.nombre ?? 'Sin cuenta';
  }

  return entrada.acreedor?.nombre ?? 'Sin acreedor';
}

function getImpuesto(entrada: Entrada) {
  if (entrada.tipo !== 'ABONO_DIRECTO_PROVEEDOR') return '-';

  return formatMoney(entrada.impuestoProveedor4x1000Cop ?? 0);
}

function getNetoAcreedor(entrada: Entrada) {
  if (entrada.tipo !== 'ABONO_DIRECTO_PROVEEDOR') return '-';

  return formatMoney(entrada.montoNetoAcreedorCop ?? entrada.montoCop);
}

export function EntradasTable({ entradas, onCreate }: EntradasTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCancelar(entrada: Entrada) {
    const motivo = window.prompt(
      `Motivo de cancelación para la entrada ${entrada.id}:`,
    );

    if (!motivo?.trim()) return;

    try {
      setLoadingId(entrada.id);

      await api.patch(`/entradas/${entrada.id}/cancelar`, {
        motivo: motivo.trim(),
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('No fue posible cancelar la entrada.');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Historial de entradas
          </h2>

          <p className="text-sm text-gray-500">
            Abonos recibidos y pagos directos realizados por clientes.
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
                Neto acreedor
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
              entradas.map((entrada) => (
                <tr
                  key={entrada.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {formatDate(entrada.creadoEn)}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                      {getTipoLabel(entrada.tipo)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {entrada.deudor?.nombre ?? 'Sin deudor'}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getDestino(entrada)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {formatMoney(entrada.montoCop)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {getImpuesto(entrada)}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {getNetoAcreedor(entrada)}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                        entrada.estado === 'REGISTRADA'
                          ? 'bg-green-50 text-green-700 ring-green-600/20'
                          : 'bg-red-50 text-red-700 ring-red-600/20',
                      ].join(' ')}
                    >
                      {entrada.estado === 'REGISTRADA'
                        ? 'Registrada'
                        : 'Cancelada'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      {entrada.estado === 'REGISTRADA' && (
                        <button
                          type="button"
                          onClick={() => handleCancelar(entrada)}
                          disabled={loadingId === entrada.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          <FiXCircle className="h-4 w-4" />
                          Cancelar
                        </button>
                      )}
                    </div>
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