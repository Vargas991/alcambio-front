'use client';

import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import { OperacionFormModal } from '@/components/operaciones/OperacionFormModal';

import type {
  Cliente,
  Cuenta,
} from '@/types/operaciones';

import type { PromedioCompraCuenta } from '@/types/cuentas';

type ClienteOperacionButtonProps = {
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios: PromedioCompraCuenta[];
};

export function ClienteOperacionButton({
  clientes,
  cuentas,
  promedios,
}: ClienteOperacionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        <FiPlus className="h-4 w-4" />

        Nueva operación
      </button>

      {open && (
        <OperacionFormModal
          open={open}
          clientes={clientes}
          cuentas={cuentas}
          promedios={promedios}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}