'use client';

import { useState } from 'react';

import { EntradaFormModal } from './EntradaFormModal';
import { EntradasTable } from './EntradasTable';
import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';
import type { Entrada } from '@/types/entradas';

type EntradasManagerProps = {
  entradas: Entrada[];
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
};

export function EntradasManager({
  entradas,
  clientes,
  cuentas,
}: EntradasManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <EntradasTable entradas={entradas} onCreate={() => setModalOpen(true)} />

      <EntradaFormModal
        open={modalOpen}
        clientes={clientes}
        cuentas={cuentas}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}