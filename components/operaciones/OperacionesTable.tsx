"use client";

import { useState } from "react";

import { formatDate, formatNumber } from "@/lib/formatters";
import { useOrganizacion } from '@/components/organizacion/OrganizacionProvider';
import type { Cliente, Cuenta, Operacion } from "@/types/operaciones";
import type { PromedioCompraCuenta } from "@/types/cuentas";

import Link from "next/link";

import { OperacionActions } from "./OperacionActions";

type OperacionesTab = "TASA" | "PORCENTAJE";

type OperacionesTableProps = {
  operaciones: Operacion[];
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios?: PromedioCompraCuenta[];
  title?: string;
  description?: string;
};

type TablaBaseProps = {
  operaciones: Operacion[];
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios?: PromedioCompraCuenta[];
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

function getOrigenName(operacion: Operacion) {
  if (operacion.tipo === "COMPRA") {
    return operacion.acreedor?.nombre ?? "Sin proveedor";
  }

  if (operacion.tipo === "VENTA") {
    return operacion.cuentaOperativa?.nombre ?? "Sin cuenta";
  }

  return operacion.acreedor?.nombre ?? "Sin origen";
}

function getDestinoLink(operacion: Operacion) {
  if (operacion.tipo === "COMPRA") {
    const id =
      operacion.cuentaOperativaId ??
      operacion.cuentaOperativa?.id;

    return {
      id,
      nombre:
        operacion.cuentaOperativa?.nombre ??
        operacion.destinatario ??
        "Cuenta operativa",
      href: id ? `/dashboard/cuentas/${id}` : "",
    };
  }

  const id = operacion.deudorId ?? operacion.deudor?.id;

  return {
    id,
    nombre:
      operacion.deudor?.nombre ??
      operacion.destinatario ??
      "Cliente",
    href: id ? `/dashboard/clientes/${id}` : "",
  };
}

function getMontoEntregado(operacion: Operacion) {
  if (
    operacion.metodoCalculo === "PORCENTAJE" &&
    operacion.montoResultado !== null &&
    operacion.montoResultado !== undefined
  ) {
    return Number(operacion.montoResultado);
  }

  return Number(operacion.montoTransaccion);
}

function getMontoDeuda(operacion: Operacion) {
  if (
    operacion.montoDeuda !== null &&
    operacion.montoDeuda !== undefined
  ) {
    return Number(operacion.montoDeuda);
  }

  if (operacion.tipo === "COMPRA") {
    return Number(operacion.totalCompraCop ?? 0);
  }

  return Number(operacion.totalVentaCop ?? 0);
}

function getMonedaDeuda(operacion: Operacion) {
  return operacion.monedaDeuda ?? "COP";
}

function getNotaText(nota: string | null | undefined) {
  return nota || "-";
}

function DestinoCell({ operacion }: { operacion: Operacion }) {
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
}

function TipoCell({ operacion }: { operacion: Operacion }) {
  const config = tipoOperacionConfig[operacion.tipo];
  const isCancelada = operacion.estado === "CANCELADA";

  return (
    <div>
      <span
        className={[
          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
          config.className,
        ].join(" ")}
      >
        {config.label}
      </span>

      {isCancelada && (
        <p className="mt-1 text-xs font-semibold text-red-600">
          Cancelada
        </p>
      )}
    </div>
  );
}

function EmptyRow({
  colSpan,
  message,
}: {
  colSpan: number;
  message: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-8 text-center text-sm text-gray-500"
      >
        <h3 className="text-lg font-medium text-gray-700">
          {message}
        </h3>
      </td>
    </tr>
  );
}

function groupTotalsByCurrency(
  operaciones: Operacion[],
  getValue: (operacion: Operacion) => number,
  getCurrency: (operacion: Operacion) => string,
) {
  return operaciones
    .filter((operacion) => operacion.estado === "REGISTRADA")
    .reduce<Record<string, number>>((acc, operacion) => {
      const currency = getCurrency(operacion);
      const value = getValue(operacion);

      acc[currency] = (acc[currency] ?? 0) + value;

      return acc;
    }, {});
}

function CurrencyTotals({
  values,
  emptyText = "-",
}: {
  values: Record<string, number>;
  emptyText?: string;
}) {
  const entries = Object.entries(values);

  if (entries.length === 0) {
    return <span className="text-gray-400">{emptyText}</span>;
  }

  return (
    <div className="space-y-1">
      {entries.map(([currency, value]) => (
        <div key={currency} className="whitespace-nowrap">
          {formatNumber(value)} {currency}
        </div>
      ))}
    </div>
  );
}

function OperacionesPorTasaTable({
  operaciones,
  clientes,
  cuentas,
  promedios,
}: TablaBaseProps) {
  const { zonaHoraria } = useOrganizacion();
  const totalCompraPorMoneda = groupTotalsByCurrency(
    operaciones,
    (operacion) => Number(operacion.totalCompraCop ?? 0),
    getMonedaDeuda,
  );

  const totalVentaPorMoneda = groupTotalsByCurrency(
    operaciones.filter(
      (operacion) => operacion.tipo !== "COMPRA",
    ),
    (operacion) => Number(operacion.totalVentaCop ?? 0),
    getMonedaDeuda,
  );

  const utilidadPorMoneda = groupTotalsByCurrency(
    operaciones.filter(
      (operacion) =>
        operacion.tipo === "VENTA" ||
        operacion.tipo === "OPERACION_DIRECTA",
    ),
    (operacion) => Number(operacion.utilidadCop ?? 0),
    getMonedaDeuda,
  );

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-base font-semibold text-gray-900">
          Operaciones por tasa
        </h3>

        <p className="text-sm text-gray-500">
          Compras, ventas y operaciones directas calculadas mediante
          tasa de compra y tasa de venta.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1320px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Tipo
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Origen
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Destino
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                T. compra
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Total compra
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                T. venta
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Total venta
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Utilidad
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Deuda
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Nota
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {operaciones.length === 0 ? (
              <EmptyRow
                colSpan={13}
                message="No hay operaciones por tasa."
              />
            ) : (
              operaciones.map((operacion) => {
                const isCancelada =
                  operacion.estado === "CANCELADA";

                return (
                  <tr
                    key={operacion.id}
                    className={[
                      "border-b border-gray-100 align-top",
                      isCancelada
                        ? "bg-red-50/40 opacity-70"
                        : "",
                    ].join(" ")}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {formatDate(operacion.fechaOperacion, zonaHoraria)}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <TipoCell operacion={operacion} />
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {getOrigenName(operacion)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      <DestinoCell operacion={operacion} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-gray-600">
                      {formatNumber(
                        Number(operacion.montoTransaccion),
                      )}{" "}
                      {operacion.monedaTransaccion}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-gray-600">
                      {formatNumber(
                        Number(operacion.tasaCompra ?? 0),
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-gray-700">
                      {formatNumber(
                        Number(operacion.totalCompraCop ?? 0),
                      )}{" "}
                      {getMonedaDeuda(operacion)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-gray-600">
                      {operacion.tipo === "COMPRA"
                        ? "-"
                        : formatNumber(
                            Number(operacion.tasaVenta ?? 0),
                          )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-gray-900">
                      {operacion.tipo === "COMPRA"
                        ? "-"
                        : `${formatNumber(
                            Number(
                              operacion.totalVentaCop ?? 0,
                            ),
                          )} ${getMonedaDeuda(operacion)}`}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-green-700">
                      {operacion.tipo === "VENTA" ||
                      operacion.tipo === "OPERACION_DIRECTA"
                        ? `${formatNumber(
                            Number(operacion.utilidadCop ?? 0),
                          )} ${getMonedaDeuda(operacion)}`
                        : "-"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-blue-700">
                      {formatNumber(getMontoDeuda(operacion))}{" "}
                      {getMonedaDeuda(operacion)}
                    </td>

                    <td className="max-w-[240px] px-5 py-4 text-sm text-gray-600">
                      <span className="line-clamp-3">
                        {getNotaText(operacion.notas)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <OperacionActions
                        operacion={operacion}
                        clientes={clientes}
                        cuentas={cuentas}
                        promedios={promedios}
                      />
                    </td>
                  </tr>
                );
              })
            )}

            {operaciones.length > 0 && (
              <tr className="bg-gray-50 align-top">
                <td
                  colSpan={6}
                  className="px-5 py-4 text-sm font-bold uppercase text-gray-900"
                >
                  Totales por moneda de deuda
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-gray-700">
                  <CurrencyTotals
                    values={totalCompraPorMoneda}
                  />
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-gray-400">
                  -
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-gray-900">
                  <CurrencyTotals
                    values={totalVentaPorMoneda}
                  />
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-green-700">
                  <CurrencyTotals values={utilidadPorMoneda} />
                </td>

                <td colSpan={3} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OperacionesPorPorcentajeTable({
  operaciones,
  clientes,
  cuentas,
  promedios,
}: TablaBaseProps) {
  const { zonaHoraria } = useOrganizacion();
  const comisionesPorMoneda = groupTotalsByCurrency(
    operaciones,
    (operacion) => Number(operacion.montoComision ?? 0),
    (operacion) => operacion.monedaTransaccion,
  );

  const entregadoPorMoneda = groupTotalsByCurrency(
    operaciones,
    getMontoEntregado,
    (operacion) => operacion.monedaTransaccion,
  );

  const deudaPorMoneda = groupTotalsByCurrency(
    operaciones,
    getMontoDeuda,
    getMonedaDeuda,
  );

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-base font-semibold text-gray-900">
          Operaciones por porcentaje
        </h3>

        <p className="text-sm text-gray-500">
          Ventas calculadas sumando o descontando una comisión
          porcentual.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1260px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Tipo
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Origen
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Destino
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto solicitado
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Porcentaje
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Aplicación
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Comisión
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto entregado
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Deuda generada
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Nota
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {operaciones.length === 0 ? (
              <EmptyRow
                colSpan={12}
                message="No hay operaciones por porcentaje."
              />
            ) : (
              operaciones.map((operacion) => {
                const isCancelada =
                  operacion.estado === "CANCELADA";

                const montoEntregado =
                  getMontoEntregado(operacion);

                return (
                  <tr
                    key={operacion.id}
                    className={[
                      "border-b border-gray-100 align-top",
                      isCancelada
                        ? "bg-red-50/40 opacity-70"
                        : "",
                    ].join(" ")}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                      {formatDate(operacion.fechaOperacion, zonaHoraria)}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <TipoCell operacion={operacion} />
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {getOrigenName(operacion)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      <DestinoCell operacion={operacion} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-gray-600">
                      {formatNumber(
                        Number(operacion.montoTransaccion),
                      )}{" "}
                      {operacion.monedaTransaccion}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-purple-700">
                      {formatNumber(
                        Number(operacion.porcentaje ?? 0),
                      )}
                      %
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          operacion.aplicacionPorcentaje ===
                          "DESCONTAR"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700",
                        ].join(" ")}
                      >
                        {operacion.aplicacionPorcentaje ===
                        "DESCONTAR"
                          ? "Descontar"
                          : "Sumar"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-gray-700">
                      {formatNumber(
                        Number(operacion.montoComision ?? 0),
                      )}{" "}
                      {operacion.monedaTransaccion}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-blue-700">
                      {formatNumber(montoEntregado)}{" "}
                      {operacion.monedaTransaccion}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-green-700">
                      {formatNumber(getMontoDeuda(operacion))}{" "}
                      {getMonedaDeuda(operacion)}
                    </td>

                    <td className="max-w-[240px] px-5 py-4 text-sm text-gray-600">
                      <span className="line-clamp-3">
                        {getNotaText(operacion.notas)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm">
                      <OperacionActions
                        operacion={operacion}
                        clientes={clientes}
                        cuentas={cuentas}
                        promedios={promedios}
                      />
                    </td>
                  </tr>
                );
              })
            )}

            {operaciones.length > 0 && (
              <tr className="bg-gray-50 align-top">
                <td
                  colSpan={7}
                  className="px-5 py-4 text-sm font-bold uppercase text-gray-900"
                >
                  Totales por moneda
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-gray-700">
                  <CurrencyTotals
                    values={comisionesPorMoneda}
                  />
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-blue-700">
                  <CurrencyTotals
                    values={entregadoPorMoneda}
                  />
                </td>

                <td className="px-5 py-4 text-right text-sm font-bold text-green-700">
                  <CurrencyTotals values={deudaPorMoneda} />
                </td>

                <td colSpan={2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function OperacionesTable({
  operaciones,
  clientes,
  cuentas,
  promedios,
  title,
  description,
}: OperacionesTableProps) {
  const [activeTab, setActiveTab] =
    useState<OperacionesTab>("TASA");

  const operacionesPorTasa = operaciones.filter(
    (operacion) =>
      !operacion.metodoCalculo ||
      operacion.metodoCalculo === "TASA",
  );

  const operacionesPorPorcentaje = operaciones.filter(
    (operacion) =>
      operacion.metodoCalculo === "PORCENTAJE",
  );

  const tabs: Array<{
    id: OperacionesTab;
    label: string;
    count: number;
  }> = [
    {
      id: "TASA",
      label: "Operaciones por tasa",
      count: operacionesPorTasa.length,
    },
    {
      id: "PORCENTAJE",
      label: "Operaciones por porcentaje",
      count: operacionesPorPorcentaje.length,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        {(title || description) && (
          <div className="border-b border-gray-100 px-6 pt-6">
            {title && (
              <h2 className="text-base font-semibold text-gray-900">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            )}

            <div
              className="mt-5 flex gap-6 overflow-x-auto"
              role="tablist"
              aria-label="Tipos de operaciones"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "relative flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-blue-600 text-blue-700"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800",
                    ].join(" ")}
                  >
                    <span>{tab.label}</span>

                    <span
                      className={[
                        "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!title && !description && (
          <div className="border-b border-gray-100 px-6 pt-4">
            <div
              className="flex gap-6 overflow-x-auto"
              role="tablist"
              aria-label="Tipos de operaciones"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "relative flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-lg font-semibold transition-colors",
                      isActive
                        ? "border-blue-600 text-blue-700"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800",
                    ].join(" ")}
                  >
                    <span>{tab.label}</span>

                    <span
                      className={[
                        "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div
        role="tabpanel"
        aria-label={
          activeTab === "TASA"
            ? "Operaciones por tasa"
            : "Operaciones por porcentaje"
        }
      >
        {activeTab === "TASA" ? (
          <OperacionesPorTasaTable
            operaciones={operacionesPorTasa}
            clientes={clientes}
            cuentas={cuentas}
            promedios={promedios}
          />
        ) : (
          <OperacionesPorPorcentajeTable
            operaciones={operacionesPorPorcentaje}
            clientes={clientes}
            cuentas={cuentas}
            promedios={promedios}
          />
        )}
      </div>
    </section>
  );
}
