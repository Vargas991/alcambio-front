"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiXCircle, FiPenTool, FiEdit3, FiTrash, FiTrash2 } from "react-icons/fi";
import axios from "axios";

import { api } from "@/lib/api";
import type { Cliente, Cuenta, Operacion } from "@/types/operaciones";
import { OperacionEditModal } from "./OperacionEditModal";
import { PromedioCompraCuenta } from "@/types/cuentas";

type OperacionActionsProps = {
  operacion: Operacion;
  cuentas: Cuenta[];
  promedios?: PromedioCompraCuenta[];
  clientes: Cliente[];
};

export function OperacionActions({
  operacion,
  cuentas,
  promedios,
  clientes,
}: OperacionActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const canCancel = operacion.estado === "REGISTRADA";

  async function handleCancel() {
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar la operación ${operacion.codigo}? Se revertirán los saldos y la operación desaparecerá del historial.`
    );

    if (!confirmDelete) {
      return;
    }

    setLoading(true);

    try {
      await api.delete(`/operaciones/${operacion.id}`);

      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ??
            "No fue posible eliminar la operación."
        );
      } else {
        alert("No fue posible eliminar la operación.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!canCancel) {
    return (
      <span className="text-xs font-medium text-gray-400">Sin acciones</span>
    );
  }

  return (
    <>
    <div className="flex gap-1">

      <button
        type="button"
        onClick={() => setOpenEdit(true)}
        className="flex flex-wrap justify-center items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 text-blue-600 hover:text-blue-700"
      >
        <FiEdit3 className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Cancelar"
        aria-label="Cancelar"
        onClick={handleCancel}
        disabled={loading}
        className="flex flex-wrap justify-center items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiTrash2 className="h-4 w-4" />
        {loading ? "Cancelando..." : ""}
      </button>

        </div>
      <OperacionEditModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        operacion={operacion}
        clientes={clientes}
        cuentas={cuentas}
        promedios={promedios}
      />
    </>
  );
}
