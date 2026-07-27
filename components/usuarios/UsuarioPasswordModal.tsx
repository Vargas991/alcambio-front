"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { api } from "@/lib/api";

import type { Usuario } from "@/types/usuarios";

type UsuarioPasswordModalProps = {
  open: boolean;
  usuario?: Usuario | null;
  onClose: () => void;
};

export function UsuarioPasswordModal({
  open,
  usuario,
  onClose,
}: UsuarioPasswordModalProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPassword("");
    setConfirmPassword("");
  }, [open, usuario]);

  if (!open || !usuario) {
    return null;
  }

  async function handleSubmit() {
    if (!usuario) {
      return;
    }
    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSubmitting(true);

      await api.patch(`/usuarios/${usuario.id}/password`, {
        password,
      });

      router.refresh();

      alert("Contraseña actualizada correctamente.");

      onClose();
    } catch (error) {
      console.error(error);

      alert("No fue posible actualizar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Cambiar contraseña
          </h2>

          <p className="text-sm text-gray-500">
            Define una nueva contraseña para <strong>{usuario.nombre}</strong>.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Nueva contraseña
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Confirmar contraseña
            </span>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </div>
      </section>
    </div>
  );
}
