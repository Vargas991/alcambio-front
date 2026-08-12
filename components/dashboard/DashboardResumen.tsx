'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

import { api } from '@/lib/api';
import { useOrganizacion } from '@/components/organizacion/OrganizacionProvider';
import { getTodayInTimeZone } from '@/lib/dates';
import { formatDate } from '@/lib/formatters';

import type {
  DashboardCuenta,
  DashboardMoneda,
  DashboardResumen as DashboardResumenType,
} from '@/types/dashboard';

type DashboardResumenProps = {
  initialData: DashboardResumenType;
};

function formatAmount(
  value: number | string | null | undefined,
) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(Number(value ?? 0));
}

function formatCurrency(
  value: number | string | null | undefined,
  moneda: DashboardMoneda,
) {
  return `${formatAmount(value)} ${moneda}`;
}



export function DashboardResumen({
  initialData,
}: DashboardResumenProps) {
  const [data, setData] =
    useState<DashboardResumenType>(initialData);

  const { zonaHoraria } = useOrganizacion();

  const [fecha, setFecha] =
    useState(
      initialData.fecha || getTodayInTimeZone(zonaHoraria),
    );

  const [loading, setLoading] =
    useState(false);

  const [moneda, setMoneda] =
    useState<DashboardMoneda>(
      initialData.monedasDisponibles[0] ??
        'COP',
    );

  async function cargarDashboard(
    nuevaFecha: string,
  ) {
    try {
      setLoading(true);

      const response =
        await api.get<DashboardResumenType>(
          '/dashboard/resumen',
          {
            params: {
              fecha: nuevaFecha,
            },
          },
        );

      setData(response.data);
    } catch (error) {
      console.error(error);

      alert(
        'No fue posible cargar el resumen del dashboard.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      fecha &&
      fecha !== data.fecha
    ) {
      cargarDashboard(fecha);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  useEffect(() => {
    if (
      !data.monedasDisponibles.includes(
        moneda,
      )
    ) {
      setMoneda(
        data.monedasDisponibles[0] ??
          'COP',
      );
    }
  }, [
    data.monedasDisponibles,
    moneda,
  ]);

  const resumen =
    useMemo(
      () =>
        data.resumenPorMoneda.find(
          (item) =>
            item.moneda === moneda,
        ),
      [
        data.resumenPorMoneda,
        moneda,
      ],
    );

  const cuentas =
    useMemo(
      () =>
        data.cuentas.filter(
          (cuenta) =>
            cuenta.moneda === moneda,
        ),
      [data.cuentas, moneda],
    );

  const movimientos =
    useMemo(
      () =>
        data.movimientos.filter(
          (movimiento) =>
            movimiento.moneda ===
            moneda,
        ),
      [data.movimientos, moneda],
    );

  if (!resumen) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          fecha={fecha}
          loading={loading}
          onFechaChange={setFecha}
          onRefresh={() =>
            cargarDashboard(fecha)
          }
        />

        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No hay información disponible para el dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        fecha={fecha}
        loading={loading}
        onFechaChange={setFecha}
        onRefresh={() =>
          cargarDashboard(fecha)
        }
      />

      {/* FILTRO GLOBAL POR MONEDA */}
      <section className="border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {data.monedasDisponibles.map(
            (item) => {
              const active =
                item === moneda;

              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() =>
                    setMoneda(item)
                  }
                  className={[
                    'shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors',
                    active
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800',
                  ].join(' ')}
                >
                  {item}
                </button>
              );
            },
          )}
        </div>
      </section>

      {/* RESUMEN PRINCIPAL */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ResumenCard
          title="Saldo en cuentas"
          value={formatCurrency(
            resumen.saldoCuentas,
            moneda,
          )}
          description={`${resumen.cantidadCuentas} cuenta${
            resumen.cantidadCuentas !== 1
              ? 's'
              : ''
          } activa${
            resumen.cantidadCuentas !== 1
              ? 's'
              : ''
          }`}
          icon={
            <FiCreditCard className="h-5 w-5" />
          }
        />

        <ResumenCard
          title="Por cobrar"
          value={formatCurrency(
            resumen.cartera.porCobrar,
            moneda,
          )}
          description="Saldo pendiente a favor del negocio"
          icon={
            <FiArrowDownLeft className="h-5 w-5" />
          }
          valueClassName="text-green-700"
        />

        <ResumenCard
          title="Por pagar"
          value={formatCurrency(
            resumen.cartera.porPagar,
            moneda,
          )}
          description="Saldo pendiente a favor de terceros"
          icon={
            <FiArrowUpRight className="h-5 w-5" />
          }
          valueClassName="text-red-700"
        />

        <ResumenCard
          title="Balance cartera"
          value={formatCurrency(
            Math.abs(
              resumen.cartera.balanceNeto,
            ),
            moneda,
          )}
          description={
            resumen.cartera.balanceNeto >= 0
              ? 'Neto por cobrar'
              : 'Neto por pagar'
          }
          icon={
            <FiUsers className="h-5 w-5" />
          }
          valueClassName={
            resumen.cartera.balanceNeto >= 0
              ? 'text-green-700'
              : 'text-red-700'
          }
        />

        <ResumenCard
          title="Utilidad generada"
          value={formatCurrency(
            resumen.utilidadGenerada,
            moneda,
          )}
          description={`Utilidad registrada el ${data.fecha}`}
          icon={
            <FiDollarSign className="h-5 w-5" />
          }
          principal
        />
      </section>

      {/* CAJA DEL DÍA */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Movimiento del día · {moneda}
          </h2>

          <p className="text-sm text-gray-500">
            Apertura, entradas, salidas y cierre de todas las cuentas en {moneda}.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-5">
          <CajaCard
            label="Saldo inicial"
            value={
              resumen.cajaDia.saldoInicial
            }
            moneda={moneda}
          />

          <CajaCard
            label="Entradas"
            value={
              resumen.cajaDia.entradas
            }
            moneda={moneda}
            positive
          />

          <CajaCard
            label="Salidas"
            value={
              resumen.cajaDia.salidas
            }
            moneda={moneda}
            negative
          />

          <CajaCard
            label="Variación"
            value={
              resumen.cajaDia.variacion
            }
            moneda={moneda}
            positive={
              resumen.cajaDia.variacion >=
              0
            }
            negative={
              resumen.cajaDia.variacion <
              0
            }
          />

          <CajaCard
            label="Saldo final"
            value={
              resumen.cajaDia.saldoFinal
            }
            moneda={moneda}
            strong
          />
        </div>
      </section>

      {/* CUENTAS */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Cuentas en {moneda}
          </h2>

          <p className="text-sm text-gray-500">
            Estado diario de las cuentas activas en la moneda seleccionada.
          </p>
        </div>

        {cuentas.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No hay cuentas activas en {moneda}.
          </div>
        ) : (
          <>
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {cuentas.map((cuenta) => (
                <CuentaCard
                  key={cuenta.id}
                  cuenta={cuenta}
                />
              ))}
            </div>

            <div className="overflow-x-auto border-t border-gray-100">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                      Cuenta
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                      Inicial
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                      Entradas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                      Salidas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                      Variación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                      Final
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                      Actual
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cuentas.map((cuenta) => (
                    <CuentaRow
                      key={cuenta.id}
                      cuenta={cuenta}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* MOVIMIENTOS DEL DÍA */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Movimientos del día · {moneda}
          </h2>

          <p className="text-sm text-gray-500">
            Libro de movimientos de las cuentas en {moneda}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                  Hora
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                  Cuenta
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                  Concepto
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                  Entrada
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                  Salida
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                  Saldo
                </th>
              </tr>
            </thead>

            <tbody>
              {movimientos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No se registraron movimientos en {moneda} para esta fecha.
                  </td>
                </tr>
              ) : (
                movimientos.map(
                  (movimiento) => {
                    const cuenta =
                      data.cuentas.find(
                        (item) =>
                          item.id ===
                          movimiento.cuentaId,
                      );

                    return (
                      <tr
                        key={movimiento.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {formatDate(
                            movimiento.creadoEn,
                            zonaHoraria,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {cuenta ? (
                            <Link
                              href={`/dashboard/cuentas/${cuenta.id}`}
                              className="text-sm font-semibold text-gray-900 transition hover:text-blue-600 hover:underline"
                            >
                              {cuenta.nombre}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500">
                              -
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {movimiento.descripcion ??
                            movimiento.tipo}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                          {movimiento.entrada >
                          0
                            ? formatCurrency(
                                movimiento.entrada,
                                moneda,
                              )
                            : '-'}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">
                          {movimiento.salida >
                          0
                            ? formatCurrency(
                                movimiento.salida,
                                moneda,
                              )
                            : '-'}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                          {formatCurrency(
                            movimiento.saldoNuevo,
                            moneda,
                          )}
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
    </div>
  );
}

function DashboardHeader({
  fecha,
  loading,
  onFechaChange,
  onRefresh,
}: {
  fecha: string;
  loading: boolean;
  onFechaChange: (fecha: string) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Posición financiera, cartera, utilidad y movimientos por moneda.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="date"
            value={fecha}
            onChange={(event) =>
              onFechaChange(
                event.target.value,
              )
            }
            className="rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
          title="Actualizar"
        >
          <FiRefreshCw
            className={[
              'h-4 w-4',
              loading
                ? 'animate-spin'
                : '',
            ].join(' ')}
          />
        </button>
      </div>
    </section>
  );
}

type ResumenCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  principal?: boolean;
  valueClassName?: string;
};

function ResumenCard({
  title,
  value,
  description,
  icon,
  principal = false,
  valueClassName,
}: ResumenCardProps) {
  return (
    <article
      className={[
        'rounded-xl border p-5 shadow-sm',
        principal
          ? 'border-blue-100 bg-blue-50'
          : 'border-gray-100 bg-white',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p
            className={[
              'mt-2 text-2xl font-bold',
              valueClassName ??
                'text-gray-900',
            ].join(' ')}
          >
            {value}
          </p>
        </div>

        <div
          className={[
            'rounded-lg p-2',
            principal
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600',
          ].join(' ')}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {description}
      </p>
    </article>
  );
}

function CajaCard({
  label,
  value,
  moneda,
  positive = false,
  negative = false,
  strong = false,
}: {
  label: string;
  value: number;
  moneda: DashboardMoneda;
  positive?: boolean;
  negative?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-lg border p-4',
        strong
          ? 'border-blue-100 bg-blue-50'
          : 'border-gray-100 bg-gray-50',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        {positive && (
          <FiTrendingUp className="h-4 w-4 text-green-600" />
        )}

        {negative && (
          <FiTrendingDown className="h-4 w-4 text-red-600" />
        )}

        <p className="text-xs font-semibold uppercase text-gray-400">
          {label}
        </p>
      </div>

      <p
        className={[
          'mt-2 text-lg font-bold',
          positive
            ? 'text-green-700'
            : negative
              ? 'text-red-700'
              : 'text-gray-900',
        ].join(' ')}
      >
        {formatCurrency(
          Math.abs(value),
          moneda,
        )}
      </p>
    </div>
  );
}

function CuentaCard({
  cuenta,
}: {
  cuenta: DashboardCuenta;
}) {
  return (
    <article className="rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/dashboard/cuentas/${cuenta.id}`}
            className="font-semibold text-gray-900 transition hover:text-blue-600 hover:underline"
          >
            {cuenta.nombre}
          </Link>

          <p className="mt-1 text-xs text-gray-400">
            {cuenta.categoria} · {cuenta.tipo}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <FiCreditCard className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold text-gray-900">
        {formatCurrency(
          cuenta.saldoActual,
          cuenta.moneda,
        )}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
        <InfoItem
          label="Entradas"
          value={formatCurrency(
            cuenta.entradas,
            cuenta.moneda,
          )}
          positive
        />

        <InfoItem
          label="Salidas"
          value={formatCurrency(
            cuenta.salidas,
            cuenta.moneda,
          )}
          negative
        />

        <InfoItem
          label="Variación"
          value={formatCurrency(
            Math.abs(
              cuenta.variacion,
            ),
            cuenta.moneda,
          )}
          positive={
            cuenta.variacion >= 0
          }
          negative={
            cuenta.variacion < 0
          }
        />

        <InfoItem
          label="Movimientos"
          value={String(
            cuenta.cantidadMovimientos,
          )}
        />
      </div>

      {cuenta.aplica4x1000 && (
        <div className="mt-4">
          <span className="rounded-full bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700">
            4x1000
          </span>
        </div>
      )}
    </article>
  );
}

function InfoItem({
  label,
  value,
  positive = false,
  negative = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase text-gray-400">
        {label}
      </p>

      <p
        className={[
          'mt-1 text-sm font-semibold',
          positive
            ? 'text-green-700'
            : negative
              ? 'text-red-700'
              : 'text-gray-900',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}

function CuentaRow({
  cuenta,
}: {
  cuenta: DashboardCuenta;
}) {
  return (
    <tr className="border-b border-gray-100 transition hover:bg-gray-50">
      <td className="px-6 py-4">
        <Link
          href={`/dashboard/cuentas/${cuenta.id}`}
          className="text-sm font-semibold text-gray-900 transition hover:text-blue-600 hover:underline"
        >
          {cuenta.nombre}
        </Link>

        <p className="mt-1 text-xs text-gray-400">
          {cuenta.cantidadMovimientos}{' '}
          movimiento
          {cuenta.cantidadMovimientos !==
          1
            ? 's'
            : ''}
        </p>
      </td>

      <td className="px-6 py-4 text-right text-sm text-gray-600">
        {formatCurrency(
          cuenta.saldoInicial,
          cuenta.moneda,
        )}
      </td>

      <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
        {formatCurrency(
          cuenta.entradas,
          cuenta.moneda,
        )}
      </td>

      <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">
        {formatCurrency(
          cuenta.salidas,
          cuenta.moneda,
        )}
      </td>

      <td
        className={[
          'px-6 py-4 text-right text-sm font-semibold',
          cuenta.variacion >= 0
            ? 'text-green-600'
            : 'text-red-600',
        ].join(' ')}
      >
        {cuenta.variacion > 0
          ? '+'
          : ''}
        {formatCurrency(
          cuenta.variacion,
          cuenta.moneda,
        )}
      </td>

      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
        {formatCurrency(
          cuenta.saldoFinal,
          cuenta.moneda,
        )}
      </td>

      <td className="px-6 py-4 text-right text-sm font-bold text-blue-700">
        {formatCurrency(
          cuenta.saldoActual,
          cuenta.moneda,
        )}
      </td>
    </tr>
  );
}
