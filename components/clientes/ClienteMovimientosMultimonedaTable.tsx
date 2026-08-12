"use client";

import { useMemo, useState } from "react";

import type { ClienteLedgerEntry } from "@/types/clientes";
import { useOrganizacion } from '@/components/organizacion/OrganizacionProvider';
import { formatDate } from '@/lib/formatters';
import type { Moneda } from "@/types/operaciones";

type MonedaFiltro = "TODAS" | Moneda;

type MovimientoMultimoneda = ClienteLedgerEntry & {
  id: string;
  fecha?: string | Date;
  creadoEn?: string | Date;
  descripcion?: string | null;
  tipo?: string | null;
  moneda?: Moneda | null;
  debito?: number | string | null;
  credito?: number | string | null;
  estado?: string | null;
};

type ClienteMovimientosMultimonedaTableProps = {
  movimientos: ClienteLedgerEntry[];
  title?: string;
  description?: string;
};

type FilaMovimiento = {
  movimiento: MovimientoMultimoneda;
  saldoAcumulado: number;
};

const MONEDAS: Moneda[] = ["BS", "USD", "USDT", "COP"];

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value: number) {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

function getDate(movimiento: MovimientoMultimoneda, zonaHoraria: string) {
  const value = movimiento.fecha ?? movimiento.creadoEn;

  if (!value) return '-';

  return formatDate(value, zonaHoraria);
}

function prepararFilas(
  movimientos: ClienteLedgerEntry[],
): FilaMovimiento[] {
  const saldos = Object.fromEntries(
    MONEDAS.map((moneda) => [moneda, 0]),
  ) as Record<Moneda, number>;

  return [...movimientos]
    .map((item) => item as MovimientoMultimoneda)
    .sort((a, b) => {
      const fechaA = new Date(
        a.fecha ?? a.creadoEn ?? 0,
      ).getTime();
      const fechaB = new Date(
        b.fecha ?? b.creadoEn ?? 0,
      ).getTime();

      return fechaA - fechaB;
    })
    .map((movimiento) => {
      const moneda = movimiento.moneda;
      const cancelada = movimiento.estado === "CANCELADA";

      if (moneda && saldos[moneda] !== undefined && !cancelada) {
        saldos[moneda] +=
          toNumber(movimiento.debito) -
          toNumber(movimiento.credito);
      }

      return {
        movimiento,
        saldoAcumulado:
          moneda && saldos[moneda] !== undefined
            ? saldos[moneda]
            : 0,
      };
    })
    .reverse();
}

export function ClienteMovimientosMultimonedaTable({
  movimientos,
  title = "Movimientos del cliente",
  description = "Débitos, créditos y saldo acumulado independiente por moneda.",
}: ClienteMovimientosMultimonedaTableProps) {
  const [monedaFiltro, setMonedaFiltro] =
    useState<MonedaFiltro>(MONEDAS[0]);

  const { zonaHoraria } = useOrganizacion();

  const filas = useMemo(
    () => prepararFilas(movimientos),
    [movimientos],
  );

  const filasFiltradas = useMemo(
    () =>
      monedaFiltro === "TODAS"
        ? filas
        : filas.filter(
            ({ movimiento }) =>
              movimiento.moneda === monedaFiltro,
          ),
    [filas, monedaFiltro],
  );

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>
        <p className="text-sm text-gray-500">{description}</p>

        <div
          className="mt-5 flex gap-5 overflow-x-auto"
          role="tablist"
          aria-label="Filtrar movimientos por moneda"
        >
          {([...MONEDAS] as MonedaFiltro[]).map(
            (moneda) => {
              const active = monedaFiltro === moneda;

              return (
                <button
                  key={moneda}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMonedaFiltro(moneda)}
                  className={[
                    "shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
                    active
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800",
                  ].join(" ")}
                >
                  {moneda === "TODAS" ? "Todas" : moneda}
                </button>
              );
            },
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Descripción
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-400">
                Moneda
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Débito
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Crédito
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Saldo acumulado
              </th>
            </tr>
          </thead>

          <tbody>
            {filasFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No hay movimientos para la moneda seleccionada.
                </td>
              </tr>
            ) : (
              filasFiltradas.map(
                ({ movimiento, saldoAcumulado }) => {
                  const moneda = movimiento.moneda;
                  const cancelada =
                    movimiento.estado === "CANCELADA";

                  return (
                    <tr
                      key={movimiento.id}
                      className={[
                        "border-b border-gray-100",
                        cancelada
                          ? "bg-red-50/40 opacity-70"
                          : "",
                      ].join(" ")}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {getDate(movimiento, zonaHoraria)}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {movimiento.tipo ?? "MOVIMIENTO"}
                        </span>
                      </td>

                      <td className="max-w-[340px] px-6 py-4 text-sm text-gray-600">
                        {movimiento.descripcion ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        {moneda ?? "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-red-700">
                        {toNumber(movimiento.debito) > 0
                          ? `${formatAmount(
                              toNumber(movimiento.debito),
                            )} ${moneda ?? ""}`
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-green-700">
                        {toNumber(movimiento.credito) > 0
                          ? `${formatAmount(
                              toNumber(movimiento.credito),
                            )} ${moneda ?? ""}`
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {moneda
                          ? `${formatAmount(
                              saldoAcumulado,
                            )} ${moneda}`
                          : "-"}
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