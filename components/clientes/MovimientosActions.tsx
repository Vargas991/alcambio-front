'use client';

import { useState } from 'react';

import { FiEdit3, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';

import type { ClienteLedgerEntry } from '@/types/clientes';
import type {
  Cliente,
  Operacion,
} from '@/types/operaciones';
import type { Entrada } from '@/types/entradas';
import type { Salida } from '@/types/salidas';
import type { Cuenta, PromedioCompraCuenta } from '@/types/cuentas';

import { EntradaFormModal } from '@/components/entradas/EntradaFormModal';
import { SalidaFormModal } from '@/components/salidas/SalidaFormModal';

// importa aquí el modal/editor real que ya uses para operaciones
import { OperacionEditModal } from '@/components/operaciones/OperacionEditModal';

type MovimientoActionsProps = {
  movimiento: ClienteLedgerEntry;
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios?: PromedioCompraCuenta[];
};

export function MovimientoActions({
  movimiento,
  clientes,
  cuentas,
  promedios = [],
}: MovimientoActionsProps) {
  const router = useRouter();

  const [
    operacionEditando,
    setOperacionEditando,
  ] = useState<Operacion | null>(null);

  const [
    entradaEditando,
    setEntradaEditando,
  ] = useState<Entrada | null>(null);

  const [
    salidaEditando,
    setSalidaEditando,
  ] = useState<Salida | null>(null);

  const [loading, setLoading] =
    useState(false);

  const operacion =
    movimiento.tipo !== 'CANCELACION'
      ? movimiento.operacion
      : null;

  const entrada =
    movimiento.tipo !== 'CANCELACION'
      ? movimiento.entrada
      : null;

  const salida =
    movimiento.tipo !== 'CANCELACION'
      ? movimiento.salida
      : null;

  const editable =
    operacion?.estado === 'REGISTRADA' ||
    entrada?.estado === 'REGISTRADA' ||
    salida?.estado === 'REGISTRADA';

  function handleEdit() {
    if (
      operacion &&
      operacion.estado === 'REGISTRADA'
    ) {
      setOperacionEditando(
        operacion as Operacion,
      );

      return;
    }

    if (
      entrada &&
      entrada.estado === 'REGISTRADA'
    ) {
      setEntradaEditando(
        entrada as Entrada,
      );

      return;
    }

    if (
      salida &&
      salida.estado === 'REGISTRADA'
    ) {
      setSalidaEditando(
        salida as Salida,
      );
    }
  }

  async function handleDelete() {
    if (!editable) {
      return;
    }

    const confirmed =
      window.confirm(
        '¿Seguro que deseas eliminar este movimiento?',
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      if (operacion) {
        await api.delete(
          `/operaciones/${operacion.id}`,
        );
      } else if (entrada) {
        await api.delete(
          `/entradas/${entrada.id}`,
        );
      } else if (salida) {
        await api.delete(
          `/salidas/${salida.id}`,
        );
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        'No fue posible eliminar el movimiento.',
      );
    } finally {
      setLoading(false);
    }
  }

  if (!editable) {
    return (
      <div className="text-right text-sm text-gray-300">
        -
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleEdit}
          disabled={loading}
          title="Editar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
        >
          <FiEdit3 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          title="Eliminar"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>

      {operacionEditando && (
        <OperacionEditModal
          open
          operacion={operacionEditando}
          clientes={clientes}
          cuentas={cuentas}
          promedios={promedios}
          onClose={() =>
            setOperacionEditando(null)
          }
        />
      )}

      <EntradaFormModal
        open={Boolean(entradaEditando)}
        entrada={entradaEditando}
        clientes={clientes}
        cuentas={cuentas}
        onClose={() =>
          setEntradaEditando(null)
        }
      />

      <SalidaFormModal
        open={Boolean(salidaEditando)}
        salida={salidaEditando}
        clientes={clientes}
        cuentas={cuentas}
        onClose={() =>
          setSalidaEditando(null)
        }
      />
    </>
  );
}