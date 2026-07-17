'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPower } from 'react-icons/fi';

import { api } from '@/lib/api';
import type { Cuenta } from '@/types/cuentas';

type CuentaEstadoButtonProps = {
  cuenta: Cuenta;
};

export function CuentaEstadoButton({ cuenta }: CuentaEstadoButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const nextEstado = cuenta.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

  async function handleClick() {
    const confirmed = window.confirm(
      cuenta.estado === 'ACTIVO'
        ? `¿Deseas inactivar la cuenta ${cuenta.nombre}?`
        : `¿Deseas activar la cuenta ${cuenta.nombre}?`,
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      await api.patch(`/cuentas/${cuenta.id}/estado`, {
        estado: nextEstado,
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('No fue posible actualizar el estado de la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className={[
        'inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-60',
        cuenta.estado === 'ACTIVO'
          ? 'border-red-200 text-red-600 hover:bg-red-50'
          : 'border-green-200 text-green-600 hover:bg-green-50',
      ].join(' ')}
    >
      <FiPower className="h-4 w-4" />
      {cuenta.estado === 'ACTIVO' ? 'Inactivar' : 'Activar'}
    </button>
  );
}