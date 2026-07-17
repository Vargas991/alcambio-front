'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

import { api } from '@/lib/api';
import type { ClienteResumenItem } from '@/types/clientes';

type ClienteDeleteButtonProps = {
  cliente: ClienteResumenItem;
};

export function ClienteDeleteButton({ cliente }: ClienteDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar a ${cliente.nombre}?`,
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await api.delete(`/clientes/${cliente.id}`);

      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ??
            'No fue posible eliminar el cliente.',
        );
      } else {
        alert('No fue posible eliminar el cliente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="Eliminar"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FiTrash2 className="h-4 w-4" />
    </button>
  );
}