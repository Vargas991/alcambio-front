"use client";

import { useState } from "react";

import { ClienteLedgerFilters } from "@/components/clientes/ClienteLedgerFilters";
import { ClienteBalancesPorMoneda } from "@/components/clientes/ClienteBalancesPorMoneda";
import { ClienteMovimientosMultimonedaTable } from "@/components/clientes/ClienteMovimientosMultimonedaTable";
import type { ClienteLedgerEntry } from "@/types/clientes";
import type { Cliente, Operacion } from "@/types/operaciones";
import type {
  Cuenta,
  PromedioCompraCuenta,
} from "@/types/cuentas";

import { ClienteMovimientosTable } from "./ClientesMovimientosTable";

type ClientePerfilTabsProps = {
  clienteId: string;
  operaciones?: Operacion[];
  movimientos: ClienteLedgerEntry[];
  promedios?: PromedioCompraCuenta[];
  cuentas: Cuenta[];
  clientes: Cliente[];
  endpointAjusteSaldo?: string;
};

type Tab = "operaciones" | "estadoCuenta";

export function ClientePerfilTabs({
  clienteId,
  movimientos,
  promedios,
  cuentas,
  clientes,
  endpointAjusteSaldo,
}: ClientePerfilTabsProps) {
  const [activeTab, setActiveTab] =
    useState<Tab>("operaciones");

  return (
    <section className="space-y-6">
      

          <ClienteLedgerFilters />


      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <div
          className="flex gap-6 overflow-x-auto border-b border-gray-100 px-6 pt-4"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "operaciones"}
            onClick={() => setActiveTab("operaciones")}
            className={[
              "border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
              activeTab === "operaciones"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800",
            ].join(" ")}
          >
            Solo operaciones
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "estadoCuenta"}
            onClick={() => setActiveTab("estadoCuenta")}
            className={[
              "border-b-2 px-1 pb-3 text-sm font-semibold transition-colors",
              activeTab === "estadoCuenta"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800",
            ].join(" ")}
          >
            Estado de cuenta
          </button>
        </div>
      </div>

      {activeTab === "operaciones" ? (
        <div className="space-y-4">

          <ClienteMovimientosTable
            movimientos={movimientos}
            clientes={clientes}
            cuentas={cuentas}
            promedios={promedios}
          />
        </div>
      ) : (
        <div className="space-y-4">

          <ClienteMovimientosMultimonedaTable
            movimientos={movimientos}
            title="Estado de cuenta del cliente"
            description="Historial multimoneda con saldo acumulado independiente para BS, USD, USDT y COP."
          />
        </div>
      )}
    </section>
  );
}