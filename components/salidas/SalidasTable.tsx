'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEdit3, FiPlus, FiTrash2 } from 'react-icons/fi';

import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { useOrganizacion } from '@/components/organizacion/OrganizacionProvider';
import type { Salida } from '@/types/salidas';

type Moneda = 'COP' | 'USD' | 'USDT' | 'BS';

type SalidaMultimoneda = Salida & {
  monedaPago?: Moneda | null;
  montoPago?: number | string | null;
  monedaAplicacion?: Moneda | null;
  montoAplicado?: number | string | null;
  tasaConversion?: number | string | null;
  cuenta?: (Salida['cuenta'] & { moneda?: Moneda | null }) | null;
};

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

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatCurrency(value: number, moneda: Moneda) {
  return `${moneda} ${formatAmount(value)}`;
}

function getMonedaPago(salida: SalidaMultimoneda): Moneda {
  return (salida.monedaPago ?? salida.cuenta?.moneda ?? 'COP') as Moneda;
}

function getMontoBase(salida: SalidaMultimoneda) {
  const monedaPago = getMonedaPago(salida);

  if (monedaPago === 'COP' && toNumber(salida.montoBaseCop) > 0) {
    return toNumber(salida.montoBaseCop);
  }

  if (toNumber(salida.montoPago) > 0) {
    return toNumber(salida.montoPago);
  }

  if (toNumber(salida.montoBaseCop) > 0) {
    return toNumber(salida.montoBaseCop);
  }

  return toNumber(salida.montoCop);
}

function getMonedaAplicacion(salida: SalidaMultimoneda): Moneda {
  return (salida.monedaAplicacion ?? getMonedaPago(salida)) as Moneda;
}

function getMontoAplicado(salida: SalidaMultimoneda) {
  const value = toNumber(salida.montoAplicado);
  return value > 0 ? value : getMontoBase(salida);
}

function getImpuestoProveedor(salida: SalidaMultimoneda) {
  if (salida.tipo !== 'PAGO_ACREEDOR' || getMonedaPago(salida) !== 'COP') {
    return '-';
  }

  return formatCurrency(
    toNumber(salida.impuestoProveedor4x1000Cop),
    'COP',
  );
}

function getImpuestoCuenta(salida: SalidaMultimoneda) {
  if (getMonedaPago(salida) !== 'COP') {
    return '-';
  }

  return formatCurrency(
    toNumber(salida.impuestoCuenta4x1000Cop),
    'COP',
  );
}

function getTotalDebitado(salida: SalidaMultimoneda) {
  const monedaPago = getMonedaPago(salida);

  if (monedaPago === 'COP' && toNumber(salida.totalDebitadoCop) > 0) {
    return formatCurrency(toNumber(salida.totalDebitadoCop), 'COP');
  }

  if (toNumber(salida.montoPago) > 0) {
    return formatCurrency(toNumber(salida.montoPago), monedaPago);
  }

  return formatCurrency(
    toNumber(salida.totalDebitadoCop ?? salida.montoCop),
    monedaPago,
  );
}

function getParTasa(
  monedaPago: Moneda,
  monedaAplicacion: Moneda,
): {
  base: Moneda;
  quote: Moneda;
} {
  if (
    (monedaPago === 'BS' && monedaAplicacion === 'COP') ||
    (monedaPago === 'COP' && monedaAplicacion === 'BS')
  ) {
    return { base: 'BS', quote: 'COP' };
  }

  if (
    (monedaPago === 'USD' && monedaAplicacion === 'COP') ||
    (monedaPago === 'COP' && monedaAplicacion === 'USD')
  ) {
    return { base: 'USD', quote: 'COP' };
  }

  if (
    (monedaPago === 'USD' && monedaAplicacion === 'BS') ||
    (monedaPago === 'BS' && monedaAplicacion === 'USD')
  ) {
    return { base: 'USD', quote: 'BS' };
  }

  if (
    (monedaPago === 'USDT' && monedaAplicacion === 'COP') ||
    (monedaPago === 'COP' && monedaAplicacion === 'USDT')
  ) {
    return { base: 'USDT', quote: 'COP' };
  }

  if (
    (monedaPago === 'USDT' && monedaAplicacion === 'BS') ||
    (monedaPago === 'BS' && monedaAplicacion === 'USDT')
  ) {
    return { base: 'USDT', quote: 'BS' };
  }

  if (
    (monedaPago === 'USD' && monedaAplicacion === 'USDT') ||
    (monedaPago === 'USDT' && monedaAplicacion === 'USD')
  ) {
    return { base: 'USD', quote: 'USDT' };
  }

  return {
    base: monedaPago,
    quote: monedaAplicacion,
  };
}

function getTasa(
  salida: SalidaMultimoneda,
) {
  const monedaPago =
    getMonedaPago(salida);

  const monedaAplicacion =
    getMonedaAplicacion(salida);

  if (
    monedaPago === monedaAplicacion
  ) {
    return '-';
  }

  const tasa =
    toNumber(
      salida.tasaConversion,
    );

  if (tasa <= 0) {
    return '-';
  }

  const par = getParTasa(
    monedaPago,
    monedaAplicacion,
  );

  return `1 ${par.base} = ${formatAmount(
    tasa,
  )} ${par.quote}`;
}

function getMontoBaseTexto(salida: SalidaMultimoneda) {
  return formatCurrency(getMontoBase(salida), getMonedaPago(salida));
}

function getMontoAplicadoTexto(salida: SalidaMultimoneda) {
  if (salida.tipo !== 'PAGO_ACREEDOR') {
    return '-';
  }

  return formatCurrency(
    getMontoAplicado(salida),
    getMonedaAplicacion(salida),
  );
}

export function SalidasTable({ salidas, onCreate, onEdit }: SalidasTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { zonaHoraria } = useOrganizacion();

  async function handleEliminar(salida: Salida) {
    const actual = salida as SalidaMultimoneda;

    const confirmed = window.confirm(
      [
        '¿Eliminar esta salida?',
        '',
        `Tipo: ${getTipoLabel(salida.tipo)}`,
        `Cuenta: ${salida.cuenta?.nombre ?? 'Sin cuenta'}`,
        `Monto base: ${getMontoBaseTexto(actual)}`,
        salida.tipo === 'PAGO_ACREEDOR'
          ? `Aplicado a deuda: ${getMontoAplicadoTexto(actual)}`
          : null,
        `Total debitado: ${getTotalDebitado(actual)}`,
        '',
        'Esta acción revertirá los movimientos y saldos generados por la salida.',
      ]
        .filter(Boolean)
        .join('\n'),
    );

    if (!confirmed) return;

    try {
      setLoadingId(salida.id);
      await api.delete(`/salidas/${salida.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('No fue posible eliminar la salida.');
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
            Pagos, gastos y retiros registrados en cuentas COP, USD, USDT o BS.
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
        <table className="w-full min-w-[1550px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">Cuenta</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">Destino</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">Monto base</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">Aplicado a deuda</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">Tasa</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">4x1000 proveedor</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">4x1000 cuenta</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">Total debitado</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-400">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {salidas.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-8 text-center text-sm text-gray-500">
                  No hay salidas registradas.
                </td>
              </tr>
            ) : (
              salidas.map((salida) => {
                const loading = loadingId === salida.id;
                const actual = salida as SalidaMultimoneda;
                const monedaPago = getMonedaPago(actual);

                return (
                  <tr
                    key={salida.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(salida.creadoEn, zonaHoraria)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                        {getTipoLabel(salida.tipo)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {salida.cuenta?.id ? (
                        <Link
                          href={`/dashboard/cuentas/${salida.cuenta.id}`}
                          className="text-sm font-semibold text-gray-700 transition hover:text-blue-600 hover:underline"
                        >
                          {salida.cuenta.nombre}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-gray-500">
                          Sin cuenta
                        </p>
                      )}

                      <p className="mt-1 text-xs font-semibold text-gray-400">
                        {monedaPago}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {salida.tipo === 'PAGO_ACREEDOR' &&
                      salida.acreedor?.id ? (
                        <Link
                          href={`/dashboard/clientes/${salida.acreedor.id}`}
                          className="text-sm font-medium text-gray-700 transition hover:text-blue-600 hover:underline"
                        >
                          {salida.acreedor.nombre}
                        </Link>
                      ) : (
                        getDestino(salida)
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {getMontoBaseTexto(actual)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-blue-700">
                      {getMontoAplicadoTexto(actual)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-xs text-gray-600">
                      {getTasa(actual)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-600">
                      {getImpuestoProveedor(actual)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-600">
                      {getImpuestoCuenta(actual)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {getTotalDebitado(actual)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span
                        className={[
                          'rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                          salida.estado === 'REGISTRADA'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-red-50 text-red-700 ring-red-600/20',
                        ].join(' ')}
                      >
                        {salida.estado === 'REGISTRADA' ? 'Registrada' : 'Cancelada'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {salida.estado === 'REGISTRADA' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(salida)}
                              disabled={loading}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                              title="Editar salida"
                            >
                              <FiEdit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEliminar(salida)}
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