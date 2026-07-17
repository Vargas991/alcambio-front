'use client';

import { useState } from 'react';
import { FiPlusCircle } from 'react-icons/fi';

import { OperacionCompraModal } from '@/components/operaciones/OperacionCompraModal';
import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';

type CuentaDetalleActionsProps = {
  cuenta: Cuenta;
  clientes: ClienteResumenItem[];
};

export function CuentaDetalleActions({
  cuenta,
  clientes,
}: CuentaDetalleActionsProps) {
  const [compraOpen, setCompraOpen] = useState(false);

  const esCuentaOperativa =
    cuenta.categoria === 'OPERATIVA' && cuenta.estado === 'ACTIVO';

  if (!esCuentaOperativa) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setCompraOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <FiPlusCircle className="h-4 w-4" />
        Registrar compra
      </button>

      <OperacionCompraModal
        open={compraOpen}
        cuenta={cuenta}
        clientes={clientes}
        onClose={() => setCompraOpen(false)}
      />
    </>
  );
}