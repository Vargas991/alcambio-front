'use client';

import { useState } from 'react';
import { FiMinusCircle } from 'react-icons/fi';

import { SalidaFormModal } from '@/components/salidas/SalidaFormModal';
import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';

type ClienteSalidaButtonProps = {
  clienteId: string;
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
};

export function ClienteSalidaButton({
  clienteId,
  clientes,
  cuentas,
}: ClienteSalidaButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        <FiMinusCircle className="h-4 w-4" />
        Registrar Pago
      </button>

      <SalidaFormModal
        open={open}
        clientes={clientes}
        cuentas={cuentas}
        initialAcreedorId={clienteId}
        onClose={() => setOpen(false)}
      />
    </>
  );
}