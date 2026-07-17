'use client';

import { useState } from 'react';

import { CuentaFormModal } from './CuentaFormModal';
import { CuentaSaldoModal } from './CuentaSaldoModal';
import { CuentasTable } from './CuentasTable';
import type { Cuenta } from '@/types/cuentas';

type CuentasManagerProps = {
  cuentas: Cuenta[];
};

export function CuentasManager({ cuentas }: CuentasManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [saldoOpen, setSaldoOpen] = useState(false);
  const [selectedCuenta, setSelectedCuenta] = useState<Cuenta | null>(null);

  function handleCreate() {
    setSelectedCuenta(null);
    setFormOpen(true);
  }

  function handleEdit(cuenta: Cuenta) {
    setSelectedCuenta(cuenta);
    setFormOpen(true);
  }

  function handleAdjustSaldo(cuenta: Cuenta) {
    setSelectedCuenta(cuenta);
    setSaldoOpen(true);
  }

  return (
    <>
      <CuentasTable
        cuentas={cuentas}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onAdjustSaldo={handleAdjustSaldo}
      />

      <CuentaFormModal
        open={formOpen}
        cuenta={selectedCuenta}
        onClose={() => {
          setFormOpen(false);
          setSelectedCuenta(null);
        }}
      />

      <CuentaSaldoModal
        open={saldoOpen}
        cuenta={selectedCuenta}
        onClose={() => {
          setSaldoOpen(false);
          setSelectedCuenta(null);
        }}
      />
    </>
  );
}