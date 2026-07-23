'use client';

import { useState } from 'react';

import type { Entrada } from '@/types/entradas';
import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';

import { EntradasTable } from './EntradasTable';
import { EntradaFormModal } from './EntradaFormModal';

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

  const [entradaEditando, setEntradaEditando] =
    useState<Entrada | null>(null);

  function handleCreate() {
    setEntradaEditando(null);
    setModalOpen(true);
  }

  function handleEdit(entrada: Entrada) {
    setEntradaEditando(entrada);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEntradaEditando(null);
  }

  return (
    <>
      <EntradasTable
        entradas={entradas}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <EntradaFormModal
        open={modalOpen}
        entrada={entradaEditando}
        clientes={clientes}
        cuentas={cuentas}
        onClose={handleClose}
      />
    </>
  );
}