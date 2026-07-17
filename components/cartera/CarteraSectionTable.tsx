import Link from 'next/link';
import { FiEye } from 'react-icons/fi';

import { formatMoney } from '@/lib/formatters';
import type { CarteraClienteItem } from '@/services/clientes.server';

type CarteraSectionTableProps = {
  title: string;
  description: string;
  items: CarteraClienteItem[];
  type: 'ME_DEBEN' | 'LES_DEBO';
};

export function CarteraSectionTable({
  title,
  description,
  items,
  type,
}: CarteraSectionTableProps) {
  const isMeDeben = type === 'ME_DEBEN';

  const titleColorClass = isMeDeben ? 'text-green-700' : 'text-red-700';
  const saldoColorClass = isMeDeben ? 'text-green-700' : 'text-red-700';

  const emptyMessage = isMeDeben
    ? 'No hay clientes con saldo por cobrar.'
    : 'No hay clientes/proveedores con saldo por pagar.';

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="border-b border-gray-100 p-6">
        <h2 className={['text-base font-semibold', titleColorClass].join(' ')}>
          {title}
        </h2>

        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Cliente / proveedor
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Documento
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Teléfono
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Débitos
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Créditos
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Saldo
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const saldoAbs = Math.abs(Number(item.saldoCop));

                return (
                  <tr
                    key={item.cliente.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.cliente.nombre}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.cliente.documento ?? '-'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.cliente.telefono ?? '-'}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      {formatMoney(item.totalDebitosCop)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                      {formatMoney(item.totalCreditosCop)}
                    </td>

                    <td
                      className={[
                        'px-6 py-4 text-right text-sm font-bold',
                        saldoColorClass,
                      ].join(' ')}
                    >
                      {formatMoney(saldoAbs)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/clientes/${item.cliente.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        title="Ver perfil"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
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