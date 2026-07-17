'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiX } from 'react-icons/fi';
import axios from 'axios';

import { api } from '@/lib/api';
import type { ClienteResumenItem } from '@/types/clientes';

type ClienteFormModalProps = {
  open: boolean;
  cliente: ClienteResumenItem | null;
  onClose: () => void;
};

export function ClienteFormModal({
  open,
  cliente,
  onClose,
}: ClienteFormModalProps) {
  const router = useRouter();

  const isEditMode = Boolean(cliente);

  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState('ACTIVO');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) return;

    setNombre(cliente?.nombre ?? '');
    setDocumento(cliente?.documento ?? '');
    setTelefono(cliente?.telefono ?? '');
    setNotas(cliente?.notas ?? '');
    // setEstado(cliente?.estado ?? 'ACTIVO');
    setErrorMessage('');
  }, [open, cliente]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nombre.trim()) {
      setErrorMessage('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const payload = {
      nombre: nombre.trim(),
      documento: documento.trim() || null,
      telefono: telefono.trim() || null,
      notas: notas.trim() || null,
      // estado,
    };

    try {
      if (cliente) {
        await api.patch(`/clientes/${cliente.id}`, payload);
      } else {
        await api.post('/clientes', payload);
      }

      router.refresh();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ??
            'No fue posible guardar el cliente.',
        );
      } else {
        setErrorMessage('No fue posible guardar el cliente.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditMode ? 'Gestionar cliente' : 'Nuevo cliente'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {isEditMode
                ? 'Actualiza la información del cliente o proveedor.'
                : 'Registra un nuevo cliente o proveedor.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {errorMessage && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Nombre
            </label>

            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej: Carlos Pérez"
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Documento
              </label>

              <input
                value={documento}
                onChange={(event) => setDocumento(event.target.value)}
                placeholder="Ej: V-12345678"
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Teléfono
              </label>

              <input
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                placeholder="Ej: 0414-0000000"
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Estado
            </label>

            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div> */}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Notas
            </label>

            <textarea
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              placeholder="Observaciones internas del cliente..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Guardando...'
                : isEditMode
                  ? 'Guardar cambios'
                  : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}