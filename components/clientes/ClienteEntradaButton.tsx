'use client';

import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import { EntradaFormModal } from '@/components/entradas/EntradaFormModal';
import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';

type ClienteEntradaButtonProps = {
  clienteId: string;
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
};

export function ClienteEntradaButton({
  clienteId,
  clientes,
  cuentas,
}: ClienteEntradaButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <FiPlus className="h-4 w-4" />
        Registrar Abono
      </button>

      <EntradaFormModal
        open={open}
        clientes={clientes}
        cuentas={cuentas}
        initialDeudorId={clienteId}
        onClose={() => setOpen(false)}
      />
    </>
  );
}