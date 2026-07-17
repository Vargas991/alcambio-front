import Link from 'next/link';
import { FiEdit2, FiEye } from 'react-icons/fi';

import type { ClienteResumenItem } from '@/types/clientes';
import { ClienteDeleteButton } from './ClienteDeleteButton';

type ClientesTableProps = {
  clientes: ClienteResumenItem[];
  onCreate: () => void;
  onEdit: (cliente: ClienteResumenItem) => void;
};

export function ClientesTable({
  clientes,
  onCreate,
  onEdit,
}: ClientesTableProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Clientes y proveedores
          </h2>

          <p className="text-sm text-gray-500">
            Listado general ordenado alfabéticamente.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
        >
          Nuevo cliente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Nombre
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Documento
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Teléfono
              </th>

              {/* <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-400">
                Estado
              </th> */}

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => {
                const isActivo = cliente.estado === 'ACTIVO';

                if (cliente.estado === 'INACTIVO') return null;
                return (

                  <tr
                    key={cliente.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {cliente.nombre}
                      </p>

                      {cliente.notas && (
                        <p className="mt-1 max-w-[320px] truncate text-xs text-gray-500">
                          {cliente.notas}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cliente.documento ?? '-'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cliente.telefono ?? '-'}
                    </td>

                    {/* <td className="px-6 py-4 text-center">
                      <span
                        className={[
                          'inline-flex rounded-full px-2 py-1 text-xs font-bold uppercase',
                          isActivo
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700',
                        ].join(' ')}
                      >
                        {cliente.estado}
                      </span>
                    </td> */}

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/clientes/${cliente.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                          title="Ver perfil"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => onEdit(cliente)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50"
                          title="Gestionar"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>

                        <ClienteDeleteButton cliente={cliente} />
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