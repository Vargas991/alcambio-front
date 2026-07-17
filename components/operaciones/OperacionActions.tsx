'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiXCircle } from 'react-icons/fi';
import axios from 'axios';

import { api } from '@/lib/api';
import type { Operacion } from '@/types/operaciones';

type OperacionActionsProps = {
  operacion: Operacion;
};

export function OperacionActions({ operacion }: OperacionActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const canCancel = operacion.estado === 'REGISTRADA';

  async function handleCancel() {
    const motivo = window.prompt(
      `Motivo de cancelación para ${operacion.codigo}:`,
    );

    if (!motivo || motivo.trim().length === 0) {
      return;
    }

    const confirmCancel = window.confirm(
      `¿Seguro que deseas cancelar la operación ${operacion.codigo}?`,
    );

    if (!confirmCancel) {
      return;
    }

    setLoading(true);

    try {
      await api.patch(`/operaciones/${operacion.id}/cancelar`, {
        motivo: motivo.trim(),
      });

      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ??
            'No fue posible cancelar la operación.',
        );
      } else {
        alert('No fue posible cancelar la operación.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (!canCancel) {
    return (
      <span className="text-xs font-medium text-gray-400">
        Sin acciones
      </span>
    );
  }

  return (
    <button
      type="button"
      title="Cancelar"
      aria-label="Cancelar"
      onClick={handleCancel}
      disabled={loading}
      className="flex flex-wrap justify-center items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiXCircle className="h-4 w-4" />
      {loading ? 'Cancelando...' : ''}
    </button>
  );
}