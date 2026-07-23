'use client';

import { useState } from 'react';

import { SalidaFormModal } from './SalidaFormModal';
import { SalidasTable } from './SalidasTable';

import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';
import type { Salida } from '@/types/salidas';

type SalidasManagerProps = {
  salidas: Salida[];
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
};

export function SalidasManager({
  salidas,
  clientes,
  cuentas,
}: SalidasManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const [salidaEditando, setSalidaEditando] =
    useState<Salida | null>(null);

  function handleCreate() {
    setSalidaEditando(null);
    setModalOpen(true);
  }

  function handleEdit(salida: Salida) {
    setSalidaEditando(salida);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setSalidaEditando(null);
  }

  return (
    <>
      <SalidasTable
        salidas={salidas}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <SalidaFormModal
        open={modalOpen}
        salida={salidaEditando}
        clientes={clientes}
        cuentas={cuentas}
        onClose={handleClose}
      />
    </>
  );
}