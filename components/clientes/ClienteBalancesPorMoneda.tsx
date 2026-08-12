"use client";

import { useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

import { ClienteSaldoAction } from "./ClienteSaldoAction";

import type { Moneda } from "@/types/operaciones";

type BalanceGlobalMoneda = {
  moneda: Moneda;
  totalDebitos: number;
  totalCreditos: number;
  saldo: number;
  estado: string;
};

type ClienteBalancesPorMonedaProps = {
  clienteId: string;
  clienteNombre: string;

  balances: BalanceGlobalMoneda[];
};

type BalanceMoneda = {
  moneda: Moneda;
  debitos: number;
  creditos: number;
  saldo: number;
};

const MONEDAS: Moneda[] = [
  "BS",
  "USD",
  "USDT",
  "COP",
];

function toNumber(
  value:
    | number
    | string
    | null
    | undefined,
) {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function formatAmount(value: number) {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

export function ClienteBalancesPorMoneda({
  clienteId,
  clienteNombre,
  balances,
}: ClienteBalancesPorMonedaProps) {
  const [open, setOpen] = useState(false);

  /**
   * Normalizamos la respuesta global para:
   *
   * 1. Mostrar siempre las cuatro monedas.
   * 2. Evitar depender de movimientos filtrados.
   * 3. Mantener cero cuando una moneda todavía
   *    no tiene movimientos.
   */
  const balancesCompletos =
    useMemo<BalanceMoneda[]>(() => {
      return MONEDAS.map((moneda) => {
        const balance = balances.find(
          (item) =>
            item.moneda === moneda,
        );

        return {
          moneda,

          debitos: toNumber(
            balance?.totalDebitos,
          ),

          creditos: toNumber(
            balance?.totalCreditos,
          ),

          saldo: toNumber(
            balance?.saldo,
          ),
        };
      });
    }, [balances]);

  const balancesConSaldo =
    balancesCompletos.filter(
      (balance) =>
        balance.saldo !== 0,
    );

  const resumenBalances =
    balancesConSaldo.length > 0
      ? balancesConSaldo
          .map(
            (balance) =>
              `${formatAmount(
                Math.abs(balance.saldo),
              )} ${balance.moneda}`,
          )
          .join(" · ")
      : "Sin saldos pendientes";

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-gray-50"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-900">
            Balances por moneda
          </h2>

          <p className="mt-1 truncate text-sm text-gray-500">
            {resumenBalances}
          </p>
        </div>

        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500">
          {open ? (
            <FiChevronUp className="h-4 w-4" />
          ) : (
            <FiChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-6 py-5">
          <p className="mb-4 text-sm text-gray-500">
            Cada moneda conserva su propio
            saldo global. Los valores no se
            suman entre sí.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {balancesCompletos.map(
              (balance) => {
                const saldo =
                  balance.saldo;

                const esPorCobrar =
                  saldo > 0;

                const esFavor =
                  saldo < 0;

                return (
                  <article
                    key={balance.moneda}
                    className={[
                      "rounded-xl border p-4",
                      esPorCobrar
                        ? "border-red-100 bg-red-50"
                        : esFavor
                          ? "border-green-100 bg-green-50"
                          : "border-gray-100 bg-gray-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          {balance.moneda}
                        </p>

                        <p
                          className={[
                            "mt-2 text-xl font-bold",
                            esPorCobrar
                              ? "text-red-700"
                              : esFavor
                                ? "text-green-700"
                                : "text-gray-700",
                          ].join(" ")}
                        >
                          {formatAmount(
                            Math.abs(saldo),
                          )}{" "}
                          {balance.moneda}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          {esPorCobrar
                            ? "Por cobrar"
                            : esFavor
                              ? "Por pagar"
                              : "Al día"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/5 pt-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase text-gray-400">
                          Débitos
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {formatAmount(
                            balance.debitos,
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase text-gray-400">
                          Créditos
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {formatAmount(
                            balance.creditos,
                          )}
                        </p>
                      </div>
                    </div>

                    <ClienteSaldoAction
                      clienteId={clienteId}
                      clienteNombre={
                        clienteNombre
                      }
                      moneda={
                        balance.moneda
                      }
                      saldoActual={
                        balance.saldo
                      }
                      label={`Ajustar saldo en ${balance.moneda}`}
                      className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </article>
                );
              },
            )}
          </div>
        </div>
      )}
    </section>
  );
}