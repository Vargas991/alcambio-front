'use client';

import { useState } from 'react';

import type { ClienteResumenItem } from '@/types/clientes';
import { ClienteFormModal } from './ClienteFormModal';
import { ClientesTable } from './ClientesTable';

type ClientesManagerProps = {
  clientes: ClienteResumenItem[];
};

export function ClientesManager({ clientes }: ClientesManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] =
    useState<ClienteResumenItem | null>(null);

  function handleCreate() {
    setSelectedCliente(null);
    setModalOpen(true);
  }

  function handleEdit(cliente: ClienteResumenItem) {
    setSelectedCliente(cliente);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setSelectedCliente(null);
  }

  return (
    <>
      <ClientesTable
        clientes={clientes}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <ClienteFormModal
        open={modalOpen}
        cliente={selectedCliente}
        onClose={handleClose}
      />
    </>
  );
}