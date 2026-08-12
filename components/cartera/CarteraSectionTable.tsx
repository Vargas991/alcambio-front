'use client';

import Link from 'next/link';
import { FiEye } from 'react-icons/fi';

import type {
  CarteraClienteItem,
  Moneda,
} from '@/types/clientes';

type CarteraSectionTableProps = {
  title: string;
  description: string;
  items: CarteraClienteItem[];
  type: 'ME_DEBEN' | 'LES_DEBO';
  moneda: Moneda;
};

function formatAmount(
  value: number | string,
) {
  const numericValue =
    Number(value ?? 0);

  return new Intl.NumberFormat(
    'es-CO',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(numericValue);
}

function formatCurrency(
  value: number | string,
  moneda: Moneda,
) {
  return `${moneda} ${formatAmount(value)}`;
}

export function CarteraSectionTable({
  title,
  description,
  items,
  type,
  moneda,
}: CarteraSectionTableProps) {
  const isMeDeben =
    type === 'ME_DEBEN';

  const titleColorClass =
    isMeDeben
      ? 'text-green-700'
      : 'text-red-700';

  const saldoColorClass =
    isMeDeben
      ? 'text-green-700'
      : 'text-red-700';

  const emptyMessage =
    isMeDeben
      ? 'No hay clientes con saldo por cobrar.'
      : 'No hay clientes/proveedores con saldo por pagar.';

  const itemsFiltrados =
    items.filter((item) => {
      const balance =
        item.balances.find(
          (balance) =>
            balance.moneda === moneda,
        );

      if (!balance) {
        return false;
      }

      return (
        Math.abs(
          Number(balance.saldo),
        ) > 0
      );
    });

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="border-b border-gray-100 p-6">
        <h2
          className={[
            'text-base font-semibold',
            titleColorClass,
          ].join(' ')}
        >
          {title}
        </h2>

        <p className="text-sm text-gray-500">
          {description}
        </p>
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
            {itemsFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {emptyMessage} en {moneda}.
                </td>
              </tr>
            ) : (
              itemsFiltrados.map(
                (item) => {
                  const balance =
                    item.balances.find(
                      (balance) =>
                        balance.moneda ===
                        moneda,
                    );

                  if (!balance) {
                    return null;
                  }

                  const saldoAbs =
                    Math.abs(
                      Number(
                        balance.saldo,
                      ),
                    );

                  return (
                    <tr
                      key={
                        item.cliente.id
                      }
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/clientes/${item.cliente.id}`}
                          className="text-sm font-semibold text-gray-900 transition hover:text-blue-600 hover:underline"
                        >
                          {
                            item.cliente
                              .nombre
                          }
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.cliente
                          .documento ??
                          '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.cliente
                          .telefono ??
                          '-'}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                        {formatCurrency(
                          balance.totalDebitos,
                          balance.moneda,
                        )}
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                        {formatCurrency(
                          balance.totalCreditos,
                          balance.moneda,
                        )}
                      </td>

                      <td
                        className={[
                          'px-6 py-4 text-right text-sm font-bold',
                          saldoColorClass,
                        ].join(' ')}
                      >
                        {formatCurrency(
                          saldoAbs,
                          balance.moneda,
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/clientes/${item.cliente.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="Ver perfil"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}