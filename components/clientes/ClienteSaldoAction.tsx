"use client";

import { useState } from "react";
import { FiEdit3 } from "react-icons/fi";

import type { Moneda } from "@/types/operaciones";

import { ClienteSaldoModal } from "./ClienteSaldoModal";

type ClienteSaldoActionProps = {
  clienteId: string;
  clienteNombre: string;
  moneda: Moneda;
  saldoActual: number | string;
  label?: string;
  className?: string;
};

export function ClienteSaldoAction({
  clienteId,
  clienteNombre,
  moneda,
  saldoActual,
  label = "Ajustar saldo",
  className,
}: ClienteSaldoActionProps) {
  const [open, setOpen] = useState(false);

  const saldoActualNumber = Number(saldoActual ?? 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!clienteId}
        className={
          className ??
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        <FiEdit3 className="h-4 w-4" />
        {label}
      </button>

      <ClienteSaldoModal
        open={open}
        onClose={() => setOpen(false)}
        clienteId={clienteId}
        clienteNombre={clienteNombre}
        moneda={moneda}
        saldoActual={
          Number.isFinite(saldoActualNumber)
            ? saldoActualNumber
            : 0
        }
      />
    </>
  );
}