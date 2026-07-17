import { FiEdit2, FiPlus, FiRefreshCw } from 'react-icons/fi';

import { CuentaEstadoButton } from './CuentaEstadoButton';
import { formatMoney, formatNumber } from '@/lib/formatters';
import type { Cuenta } from '@/types/cuentas';
import Link from 'next/link';

type CuentasTableProps = {
  cuentas: Cuenta[];
  onCreate: () => void;
  onEdit: (cuenta: Cuenta) => void;
  onAdjustSaldo: (cuenta: Cuenta) => void;
};

function getCategoriaLabel(categoria: Cuenta['categoria']) {
  if (categoria === 'BASE_COP') return 'Base COP';
  return 'Operativa';
}

function getSaldo(cuenta: Cuenta) {
  if (cuenta.moneda === 'COP') {
    return formatMoney(cuenta.saldo);
  }

  return `${formatNumber(cuenta.saldo)} ${cuenta.moneda}`;
}

function getCategoriaClass(categoria: Cuenta['categoria']) {
  if (categoria === 'BASE_COP') {
    return 'bg-green-50 text-green-700 ring-green-600/20';
  }

  return 'bg-blue-50 text-blue-700 ring-blue-600/20';
}

export function CuentasTable({
  cuentas,
  onCreate,
  onEdit,
  onAdjustSaldo,
}: CuentasTableProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Listado de cuentas
          </h2>

          <p className="text-sm text-gray-500">
            Cuentas base COP y cuentas operativas para movimientos de divisas.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlus className="h-4 w-4" />
          Nueva cuenta
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Cuenta
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Categoría
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Tipo
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Moneda
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Saldo
              </th>

              <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-400">
                4x1000
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
            {cuentas.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No hay cuentas registradas.
                </td>
              </tr>
            ) : (
              cuentas.map((cuenta) => (
                <tr
                  key={cuenta.id}
                  className="border-b border-gray-100 transition hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {cuenta.nombre}
                    </p>

                    {cuenta.notas && (
                      <p className="mt-1 max-w-[280px] truncate text-sm text-gray-500">
                        {cuenta.notas}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                        getCategoriaClass(cuenta.categoria),
                      ].join(' ')}
                    >
                      {getCategoriaLabel(cuenta.categoria)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {cuenta.tipo}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                    {cuenta.moneda}
                  </td>

                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    {getSaldo(cuenta)}
                  </td>

                  <td className="px-6 py-4 text-center text-sm">
                    {cuenta.aplica4x1000 ? (
                      <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-600/20">
                        Aplica
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500 ring-1 ring-inset ring-gray-600/20">
                        No aplica
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center text-sm">
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                        cuenta.estado === 'ACTIVO'
                          ? 'bg-green-50 text-green-700 ring-green-600/20'
                          : 'bg-red-50 text-red-700 ring-red-600/20',
                      ].join(' ')}
                    >
                      {cuenta.estado === 'ACTIVO' ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/cuentas/${cuenta.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        Ver
                      </Link>
                      
                      <button
                        type="button"
                        onClick={() => onAdjustSaldo(cuenta)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        <FiRefreshCw className="h-4 w-4" />
                        Saldo
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(cuenta)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        Editar
                      </button>

                      <CuentaEstadoButton cuenta={cuenta} />
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