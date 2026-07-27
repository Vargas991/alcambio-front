'use client';

import { useState } from 'react';

import { ClienteLedgerFilters } from '@/components/clientes/ClienteLedgerFilters';
import { ClienteLedgerTable } from '@/components/clientes/ClienteLedgerTable';
import { OperacionesFilters } from '@/components/operaciones/OperacionesFilters';
import { OperacionesTable } from '@/components/operaciones/OperacionesTable';
import type { ClienteLedgerEntry } from '@/types/clientes';
import type { Cliente, Operacion } from '@/types/operaciones';
import { Cuenta, PromedioCompraCuenta } from '@/types/cuentas';
import { ClienteMovimientosTable } from './ClientesMovimientosTable';

type ClientePerfilTabsProps = {
  operaciones: Operacion[];
  movimientos: ClienteLedgerEntry[];
  promedios?: PromedioCompraCuenta[];
  cuentas: Cuenta[];
  clientes: Cliente[];
};

export function ClientePerfilTabs({
  operaciones,
  movimientos,
  promedios,
  cuentas,
  clientes
}: ClientePerfilTabsProps) {
  const [activeTab, setActiveTab] = useState<'operaciones' | 'estadoCuenta'>(
    'operaciones',
  );

  return (
    <section className="space-y-4">
      <div className="rounded-xl bg-white p-2 shadow-md">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('operaciones')}
            className={[
              'rounded-lg px-4 py-3 text-sm font-semibold transition',
              activeTab === 'operaciones'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50',
            ].join(' ')}
          >
            Solo operaciones
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('estadoCuenta')}
            className={[
              'rounded-lg px-4 py-3 text-sm font-semibold transition',
              activeTab === 'estadoCuenta'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50',
            ].join(' ')}
          >
            Estado de cuenta
          </button>
        </div>
      </div>

      {activeTab === 'operaciones' ? (
        <div className="space-y-4">
          <ClienteLedgerFilters />

          <ClienteMovimientosTable
            movimientos={movimientos}
            clientes={clientes}
            cuentas={cuentas}
            promedios={promedios}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <ClienteLedgerFilters />

          <ClienteLedgerTable
            movimientos={movimientos}
            title="Estado de cuenta del cliente"
            description="Historial completo: operaciones, entradas, salidas, pagos, abonos y cancelaciones."
          />
        </div>
      )}
    </section>
  );
}