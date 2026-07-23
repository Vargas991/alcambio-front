'use client';

import { useState } from 'react';
import { FiEdit3 } from 'react-icons/fi';

import { ClienteSaldoModal } from './ClienteSaldoModal';

type ClienteSaldoActionProps = {
  clienteId: string;
  clienteNombre: string;
  saldoActualCop: string;
};

export function ClienteSaldoAction({
  clienteId,
  clienteNombre,
  saldoActualCop,
}: ClienteSaldoActionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        <FiEdit3 className="h-4 w-4" />
        Ajustar saldo
      </button>

      <ClienteSaldoModal
        open={open}
        onClose={() => setOpen(false)}
        clienteId={clienteId}
        clienteNombre={clienteNombre}
        saldoActualCop={Number(saldoActualCop)}
      />
    </>
  );
}