'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/formatters';
import type { Cuenta } from '@/types/cuentas';

type CuentaSaldoModalProps = {
  open: boolean;
  cuenta: Cuenta | null;
  onClose: () => void;
};

function formatSaldo(cuenta: Cuenta) {
  if (cuenta.moneda === 'COP') {
    return formatMoney(cuenta.saldo);
  }

  return `${formatNumber(cuenta.saldo)} ${cuenta.moneda}`;
}

export function CuentaSaldoModal({
  open,
  cuenta,
  onClose,
}: CuentaSaldoModalProps) {
  const router = useRouter();

  const [saldoReal, setSaldoReal] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !cuenta) return;

    setSaldoReal(String(Number(cuenta.saldo)));
    setDescripcion('');
  }, [open, cuenta]);

  if (!open || !cuenta) return null;

  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!saldoReal) {
        alert('Debes indicar el saldo real.');
        return;
      }

      if (!descripcion.trim()) {
        alert('Debes indicar una descripción del ajuste.');
        return;
      }

      await api.patch(`/cuentas/${cuenta?.id}/ajustar-saldo`, {
        saldoReal: Number(saldoReal),
        descripcion: descripcion.trim(),
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert('No fue posible ajustar el saldo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Ajustar saldo real
          </h2>

          <p className="text-sm text-gray-500">
            Cuenta: <strong>{cuenta.nombre}</strong>
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Saldo actual: <strong>{formatSaldo(cuenta)}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Saldo real
            </span>

            <input
              type="number"
              value={saldoReal}
              onChange={(event) => setSaldoReal(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Descripción
            </span>

            <textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Ej: Ajuste por conciliación bancaria"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Ajustando...' : 'Ajustar saldo'}
          </button>
        </div>
      </section>
    </div>
  );
}