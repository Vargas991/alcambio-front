'use client';

import { FiX } from 'react-icons/fi';

import { OperacionForm } from '@/components/operaciones/OperacionForm';

import type {
  Cliente,
  Cuenta,
} from '@/types/operaciones';

import type { PromedioCompraCuenta } from '@/types/cuentas';

type OperacionFormModalProps = {
  open: boolean;
  onClose: () => void;

  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios: PromedioCompraCuenta[];
};

export function OperacionFormModal({
  open,
  onClose,
  clientes,
  cuentas,
  promedios,
}: OperacionFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Nueva operación
            </h2>

            <p className="text-sm text-gray-500">
              Registra una nueva operación.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Cerrar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <OperacionForm
            clientes={clientes}
            cuentas={cuentas}
            promedios={promedios}
          />
        </div>
      </div>
    </div>
  );
}