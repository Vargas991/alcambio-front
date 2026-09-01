"use client";

import { formatDate, formatMoney, formatNumber } from "@/lib/formatters";
import { useOrganizacion } from '@/components/organizacion/OrganizacionProvider';
import type { Cliente, Cuenta, Operacion, PaginatedMeta } from "@/types/operaciones";

import { OperacionActions } from "./OperacionActions";
import Link from "next/link";
import { usePathname, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { PromedioCompraCuenta } from '@/types/cuentas';

type OperacionesTableProps = {
  operaciones: Operacion[];
  meta?: PaginatedMeta;
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios?: PromedioCompraCuenta[];
  title?: string;
  description?: string;
};

const tipoOperacionConfig: Record<
  Operacion["tipo"],
  {
    label: string;
    className: string;
  }
> = {
  VENTA: {
    label: "Venta",
    className: "bg-green-50 text-green-700 ring-green-600/20",
  },
  OPERACION_DIRECTA: {
    label: "Directa",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  COMPRA: {
    label: "Compra",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
  },
};

function getClienteName(operacion: Operacion) {
  if (operacion.tipo === 'COMPRA') {
    return operacion.acreedor?.nombre ?? operacion.destinatario ?? 'Sin cliente';
  }

  if (operacion.tipo === 'VENTA') {
    return operacion.deudor?.nombre ?? operacion.destinatario ?? 'Sin cliente';
  }

  if (operacion.tipo === 'OPERACION_DIRECTA') {
    return operacion.deudor?.nombre ?? operacion.destinatario ?? 'Sin cliente';
  }

  return (
    operacion.deudor?.nombre ??
    operacion.acreedor?.nombre ??
    operacion.destinatario ??
    'Sin cliente'
  );
}

function getClienteId(operacion: Operacion) {
  return operacion.deudor?.id ?? operacion.deudor?.id ?? null;
}

function getOrigenName(operacion: Operacion) {
  if (operacion.tipo === 'COMPRA') {
    return operacion.acreedor?.nombre ?? 'Sin proveedor';
  }

  if (operacion.tipo === 'VENTA') {
    return operacion.cuentaOperativa?.nombre ?? 'Sin cuenta';
  }

  if (operacion.tipo === 'OPERACION_DIRECTA') {
    return operacion.acreedor?.nombre ?? 'Sin origen';
  }

  return (
    operacion.acreedor?.nombre ??
    operacion.cuentaOperativa?.nombre ??
    'Sin origen'
  );
}

function getDestinoName(operacion: Operacion) {
  if (operacion.tipo === 'COMPRA') {
    return operacion.cuentaOperativa?.nombre ?? 'Sin cuenta destino';
  }

  if (operacion.tipo === 'VENTA') {
    return operacion.deudor?.nombre ?? 'Sin cliente';
  }

  if (operacion.tipo === 'OPERACION_DIRECTA') {
    return operacion.deudor?.nombre ?? 'Sin cliente';
  }

  return (
    operacion.deudor?.nombre ??
    operacion.cuentaOperativa?.nombre ??
    'Sin destino'
  );
}

function getNotaText(nota: string | null) {
  if (!nota) return "-";

  return nota;
}

function getDestinoLink(operacion: Operacion) {
  if (operacion.tipo === 'VENTA') {
    return {
      tipo: 'CLIENTE',
      id: operacion.deudorId ?? operacion.deudor?.id,
      nombre: operacion.deudor?.nombre ?? operacion.destinatario ?? 'Cliente',
      href: `/dashboard/clientes/${operacion.deudorId ?? operacion.deudor?.id}`,
    };
  }

  if (operacion.tipo === 'COMPRA') {
    return {
      tipo: 'CUENTA',
      id: operacion.cuentaOperativaId ?? operacion.cuentaOperativa?.id,
      nombre:
        operacion.cuentaOperativa?.nombre ??
        operacion.destinatario ??
        'Cuenta operativa',
      href: `/dashboard/cuentas/${
        operacion.cuentaOperativaId ?? operacion.cuentaOperativa?.id
      }`,
    };
  }

  if (operacion.tipo === 'OPERACION_DIRECTA') {
    return {
      tipo: 'CLIENTE',
      id: operacion.deudorId ?? operacion.deudor?.id,
      nombre: operacion.deudor?.nombre ?? operacion.destinatario ?? 'Cliente',
      href: `/dashboard/clientes/${operacion.deudorId ?? operacion.deudor?.id}`,
    };
  }

  return null;
}

export function OperacionesTable({ operaciones, meta, clientes, cuentas, promedios, title, description }: OperacionesTableProps) {
  const { zonaHoraria } = useOrganizacion();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    if (!params.has('pageSize') && meta?.pageSize) {
      params.set('pageSize', String(meta.pageSize));
    }
    return `${pathname}?${params.toString()}`;
  };

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="border-b border-gray-100 p-6">
        {title && (
          <h2 className="text-base font-semibold text-gray-900">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      {meta && meta.total > 0 && (
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {operaciones.length} de {meta.total} operaciones
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={currentPage > 1 ? buildPageHref(currentPage - 1) : '#'}
              aria-disabled={currentPage <= 1}
              className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium ${currentPage <= 1 ? 'pointer-events-none cursor-not-allowed border-gray-200 text-gray-400' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Anterior
            </Link>

            <span className="text-sm font-medium text-gray-700">
              Página {currentPage} {totalPages > 0 ? `de ${totalPages}` : ''}
            </span>

            <Link
              href={currentPage < totalPages ? buildPageHref(currentPage + 1) : '#'}
              aria-disabled={currentPage >= totalPages}
              className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium ${currentPage >= totalPages ? 'pointer-events-none cursor-not-allowed border-gray-200 text-gray-400' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Siguiente
            </Link>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>

              {/* <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Código
              </th> */}

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Tipo
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Origen
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Cliente
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                TCompra
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Total Compra
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                TVenta
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Total venta
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Utilidad
              </th>

              {/* <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Estado
              </th> */}

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Nota
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {operaciones.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <h3 className="text-lg font-medium text-gray-700">
                    No hay operaciones registradas.
                  </h3>
                </td>
              </tr>
            ) : (
              operaciones.map((operacion) => {
                const isCancelada = operacion.estado === "CANCELADA";
                const tipoConfig = tipoOperacionConfig[operacion.tipo];
                const isCompra = operacion.tipo === "COMPRA";

                return (
                  <tr key={operacion.id} className="border-b border-gray-100">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(operacion.fechaOperacion, zonaHoraria)}
                    </td>

                    {/* <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {operacion.codigo}
                    </td> */}

                    <td className="px-6 py-4 text-sm">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                          tipoConfig.className,
                        ].join(" ")}
                      >
                        {tipoConfig.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getOrigenName(operacion)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                        {(() => {
                          const destino = getDestinoLink(operacion);

                          if (!destino?.id) {
                            return <span className="text-gray-400">Sin destino</span>;
                          }

                          return (
                            <Link
                              href={destino.href}
                              className="font-medium text-blue-600 hover:text-blue-700"
                            >
                              {destino.nombre}
                            </Link>
                          );
                        })()}
                      </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {formatNumber(operacion.montoTransaccion)}{" "}
                      {operacion.monedaTransaccion}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {formatNumber(operacion.tasaCompra)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {formatNumber(operacion.totalCompraCop)}{" "}
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {isCompra ? "-" : formatNumber(operacion.tasaVenta)}
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {isCompra ? "-" : formatMoney(operacion.totalVentaCop)}
                    </td>

                    <td className={`px-6 py-4 text-right text-sm font-semibold text-green-700 
                            ${isCancelada
                            ? "bg-red-50 text-red-700"
                            : "bg-green-50 text-green-700"}`}>
                      {operacion.tipo === "VENTA" ||
                      operacion.tipo === "OPERACION_DIRECTA"
                        ? formatMoney(operacion.utilidadCop)
                        : "-"}
                    </td>

                    {/* <td className="px-6 py-4 text-center text-sm">
                    <span
                      title={operacion.estado}
                      className={[
                        'inline-flex h-8 w-8 items-center justify-center rounded-full',
                        isCancelada
                          ? 'bg-red-50 text-red-600'
                          : 'bg-green-50 text-green-600',
                      ].join(' ')}
                    >
                      {isCancelada ? (
                        <FiXCircle className="h-4 w-4" />
                      ) : (
                        <FiCheckCircle className="h-4 w-4" />
                      )}
                    </span>
                  </td> */}

                    <td className="max-w-[260px] px-6 py-4 text-sm text-gray-600">
                      <span className="line-clamp-2">
                        {getNotaText(operacion.notas)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <OperacionActions operacion={operacion}
                        clientes={clientes}
                        cuentas={cuentas}
                        promedios={promedios} />
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
