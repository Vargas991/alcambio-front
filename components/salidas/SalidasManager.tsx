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

  return (
    <>
      <SalidasTable salidas={salidas} onCreate={() => setModalOpen(true)} />

      <SalidaFormModal
        open={modalOpen}
        clientes={clientes}
        cuentas={cuentas}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}