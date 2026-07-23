'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { api } from '@/lib/api';
import { formatMoney } from '@/lib/formatters';
import {
  numberToInputValue,
  parseFormattedNumber,
} from '@/lib/number-format';
import { FormattedNumberInput } from '@/components/ui/FormattedNumberInput';

type ClienteSaldoModalProps = {
  open: boolean;
  onClose: () => void;
  clienteId: string;
  clienteNombre: string;
  saldoActualCop: number;
};

export function ClienteSaldoModal({
  open,
  onClose,
  clienteId,
  clienteNombre,
  saldoActualCop,
}: ClienteSaldoModalProps) {
  const router = useRouter();

  const [monto, setMonto] = useState(
    numberToInputValue(Math.abs(saldoActualCop)),
  );

  const [tipoSaldo, setTipoSaldo] = useState<'ME_DEBE' | 'LE_DEBO' | 'SALDADO'>(
    saldoActualCop === 0 ? 'SALDADO' : (saldoActualCop <0 ?'LE_DEBO' : 'ME_DEBE'),
    
  );

  const [motivo, setMotivo] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!open) {
    return null;
  }

  const montoNumber = parseFormattedNumber(monto);

  const saldoObjetivoCop =
    tipoSaldo === 'LE_DEBO'
      ? -Math.abs(montoNumber)
      : Math.abs(montoNumber);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');

    if (!motivo.trim()) {
      setErrorMessage('Ingrese el motivo del ajuste.');
      return;
    }

    if (montoNumber < 0) {
      setErrorMessage('Ingrese un saldo válido.');
      return;
    }

    setSaving(true);

    try {
      await api.patch(`/clientes/${clienteId}/ajustar-saldo`, {
        saldoObjetivoCop,
        motivo: motivo.trim(),
      });

      router.refresh();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ??
            'No fue posible ajustar el saldo.',
        );
      } else {
        setErrorMessage('No fue posible ajustar el saldo.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Ajustar saldo
          </h2>

          <p className="text-sm text-gray-500">
            {clienteNombre}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* <label className="mb-1 block text-sm font-semibold text-gray-700">
              Saldo actual
            </label> */}

            {/* <input
              readOnly
              value={formatMoney(Math.abs(saldoActualCop))}
              className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700"
            /> */}

            {/* <p
              className={[
                'mt-1 text-xs font-semibold',
                saldoActualCop > 0
                  ? 'text-green-600'
                  : saldoActualCop < 0
                    ? 'text-red-600'
                    : 'text-gray-500',
              ].join(' ')}
            >
              {saldoActualCop > 0
                ? 'ME DEBE'
                : saldoActualCop < 0
                  ? 'LE DEBO'
                  : 'SALDADO'}
            </p> */}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Tipo de saldo
            </label>

            <select
              value={tipoSaldo}
              onChange={(event) =>
                setTipoSaldo(
                  event.target.value as 'ME_DEBE' | 'LE_DEBO',
                )
              }
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ME_DEBE">Me debe</option>
              <option value="LE_DEBO">Le debo</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Nuevo saldo
            </label>

            <FormattedNumberInput
              value={monto}
              onChange={(value) => setMonto(value)}
              placeholder="0"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Motivo
            </label>

            <input
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Motivo del ajuste"
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}