'use client';

import { useEffect, useState } from 'react';
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiBriefcase,
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';

import { api } from '@/lib/api';
import { formatMoney } from '@/lib/formatters';

import type {
  DashboardCuentaCaja,
  DashboardCuentaOperativa,
  DashboardResumen as DashboardResumenType,
} from '@/types/dashboard';

type DashboardResumenProps = {
  initialData: DashboardResumenType;
};

function formatCurrency(
  value: number,
  moneda = 'COP',
) {
  if (moneda === 'COP') {
    return formatMoney(value);
  }

  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getTodayLocal() {
  const formatter = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: 'America/Caracas',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  );

  return formatter.format(new Date());
}

export function DashboardResumen({
  initialData,
}: DashboardResumenProps) {
  const [data, setData] =
    useState<DashboardResumenType>(initialData);

  const [fecha, setFecha] = useState(
    initialData.fecha || getTodayLocal(),
  );

  const [loading, setLoading] =
    useState(false);

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
  }, [fecha]);

  const {
    capital,
    caja,
  } = data;

  return (
    <div className="space-y-6">
      {/* =====================================
          HEADER
      ====================================== */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Estado financiero y movimientos
            diarios del negocio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="date"
              value={fecha}
              onChange={(event) =>
                setFecha(
                  event.target.value,
                )
              }
              className="rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              cargarDashboard(fecha)
            }
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

      {/* =====================================
          CAPITAL PRINCIPAL
      ====================================== */}
      <section className="grid gap-4 md:grid-cols-3">
        <ResumenCard
          title="Disponible en COP"
          value={formatMoney(
            capital.disponibleCop,
          )}
          description="Dinero disponible en cuentas base"
          icon={
            <FiCreditCard className="h-5 w-5" />
          }
        />

        <ResumenCard
          title="Inventario de divisas"
          value={formatMoney(
            capital.inventarioDivisasCop,
          )}
          description="Valorizado al promedio de compra"
          icon={
            <FiDollarSign className="h-5 w-5" />
          }
        />

        <ResumenCard
          title="Capital operativo"
          value={formatMoney(
            capital.capitalOperativoCop,
          )}
          description="COP disponible + divisas al costo"
          icon={
            <FiBriefcase className="h-5 w-5" />
          }
          principal
        />
      </section>

      {/* =====================================
          CUENTAS COP
      ====================================== */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Cuentas COP
          </h2>

          <p className="text-sm text-gray-500">
            Disponibilidad actual en cuentas
            base.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {capital.cuentasBase.map(
            (cuenta) => (
              <article
                key={cuenta.id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {cuenta.nombre}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {cuenta.moneda}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <FiCreditCard className="h-4 w-4" />
                  </div>
                </div>

                <p className="mt-5 text-2xl font-bold text-gray-900">
                  {formatMoney(
                    cuenta.saldo,
                  )}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Saldo actual
                  </span>

                  {cuenta.aplica4x1000 && (
                    <span className="rounded-full bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700">
                      4x1000
                    </span>
                  )}
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      {/* =====================================
          INVENTARIO OPERATIVO
      ====================================== */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Inventario de divisas
          </h2>

          <p className="text-sm text-gray-500">
            Saldos operativos valorizados según
            el promedio de compra.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          {capital.cuentasOperativas.length ===
          0 ? (
            <p className="text-sm text-gray-500">
              No hay cuentas operativas
              activas.
            </p>
          ) : (
            capital.cuentasOperativas.map(
              (cuenta) => (
                <CuentaOperativaCard
                  key={cuenta.id}
                  cuenta={cuenta}
                />
              ),
            )
          )}
        </div>
      </section>

      {/* =====================================
          CAJA DEL DÍA
      ====================================== */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Caja del día
          </h2>

          <p className="text-sm text-gray-500">
            Apertura, movimientos y cierre de
            las cuentas COP.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-5">
          <CajaCard
            label="Saldo inicial"
            value={
              caja.resumen.saldoInicial
            }
          />

          <CajaCard
            label="Entradas"
            value={caja.resumen.entradas}
            positive
          />

          <CajaCard
            label="Salidas"
            value={caja.resumen.salidas}
            negative
          />

          <CajaCard
            label="Variación"
            value={caja.resumen.variacion}
            positive={
              caja.resumen.variacion >= 0
            }
            negative={
              caja.resumen.variacion < 0
            }
          />

          <CajaCard
            label="Saldo final"
            value={caja.resumen.saldoFinal}
            strong
          />
        </div>

        {/* CAJA POR CUENTA */}
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full min-w-[900px]">
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
              </tr>
            </thead>

            <tbody>
              {caja.cuentas.map(
                (cuenta) => (
                  <CajaCuentaRow
                    key={cuenta.id}
                    cuenta={cuenta}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================
          MOVIMIENTOS DEL DÍA
      ====================================== */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Movimientos del día
          </h2>

          <p className="text-sm text-gray-500">
            Libro de caja de las cuentas COP.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
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
              {caja.movimientos.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No se registraron
                    movimientos en esta fecha.
                  </td>
                </tr>
              ) : (
                caja.movimientos.map(
                  (movimiento) => {
                    const cuenta =
                      caja.cuentas.find(
                        (item) =>
                          item.id ===
                          movimiento.cuentaId,
                      );

                    return (
                      <tr
                        key={
                          movimiento.id
                        }
                        className="border-b border-gray-100"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Intl.DateTimeFormat(
                            'es-VE',
                            {
                              timeZone:
                                'America/Caracas',
                              hour: '2-digit',
                              minute:
                                '2-digit',
                            },
                          ).format(
                            new Date(
                              movimiento.creadoEn,
                            ),
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {cuenta?.nombre ??
                            '-'}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {movimiento.descripcion ??
                            movimiento.tipo}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                          {movimiento.entrada >
                          0
                            ? formatMoney(
                                movimiento.entrada,
                              )
                            : '-'}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">
                          {movimiento.salida >
                          0
                            ? formatMoney(
                                movimiento.salida,
                              )
                            : '-'}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatMoney(
                            movimiento.saldoNuevo,
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

/**
 * ==========================================
 * SUBCOMPONENTES
 * ==========================================
 */

type ResumenCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  principal?: boolean;
};

function ResumenCard({
  title,
  value,
  description,
  icon,
  principal = false,
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
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
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

function CuentaOperativaCard({
  cuenta,
}: {
  cuenta: DashboardCuentaOperativa;
}) {
  const tieneDiferencia =
    Math.abs(cuenta.diferenciaSaldo) >
    0.01;

  return (
    <article className="rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">
            {cuenta.nombre}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {cuenta.moneda}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-2 text-green-700">
          <FiDollarSign className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(
            cuenta.saldoActual,
            cuenta.moneda,
          )}{' '}
          <span className="text-sm font-semibold text-gray-400">
            {cuenta.moneda}
          </span>
        </p>
      </div>

      <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
        <InfoRow
          label="Promedio compra"
          value={formatMoney(
            cuenta.promedioCompra,
          )}
        />

        <InfoRow
          label="Valor al costo"
          value={formatMoney(
            cuenta.valorActualCop,
          )}
          strong
        />

        {tieneDiferencia && (
          <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700">
            Diferencia de saldo:{' '}
            {formatCurrency(
              cuenta.diferenciaSaldo,
              cuenta.moneda,
            )}{' '}
            {cuenta.moneda}
          </div>
        )}
      </div>
    </article>
  );
}

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span
        className={[
          'text-sm text-gray-900',
          strong
            ? 'font-bold'
            : 'font-semibold',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}

function CajaCard({
  label,
  value,
  positive = false,
  negative = false,
  strong = false,
}: {
  label: string;
  value: number;
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
        {formatMoney(value)}
      </p>
    </div>
  );
}

function CajaCuentaRow({
  cuenta,
}: {
  cuenta: DashboardCuentaCaja;
}) {
  return (
    <tr className="border-b border-gray-100 transition hover:bg-gray-50">
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {cuenta.nombre}
        </p>

        <p className="text-xs text-gray-400">
          {cuenta.cantidadMovimientos}{' '}
          movimiento
          {cuenta.cantidadMovimientos !==
          1
            ? 's'
            : ''}
        </p>
      </td>

      <td className="px-6 py-4 text-right text-sm text-gray-600">
        {formatMoney(
          cuenta.saldoInicial,
        )}
      </td>

      <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
        {formatMoney(
          cuenta.entradas,
        )}
      </td>

      <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">
        {formatMoney(
          cuenta.salidas,
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
        {formatMoney(
          cuenta.variacion,
        )}
      </td>

      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
        {formatMoney(
          cuenta.saldoFinal,
        )}
      </td>
    </tr>
  );
}