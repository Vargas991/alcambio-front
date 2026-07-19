'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import type {
  CategoriaCuenta,
  Cuenta,
  MonedaCuenta,
  TipoCuenta,
} from '@/types/cuentas';
import { FormattedNumberInput } from '../ui/FormattedNumberInput';
import { parseFormattedNumber } from '@/lib/number-format';

type CuentaFormModalProps = {
  open: boolean;
  cuenta: Cuenta | null;
  onClose: () => void;
};

const tiposBaseCop: TipoCuenta[] = ['CAJA', 'OFICINA', 'BANCO', 'OTRA'];

const tiposOperativos: TipoCuenta[] = [
  'ZELLE',
  'BINANCE',
  'BILLETERA_BS',
  'OTRA',
];

export function CuentaFormModal({
  open,
  cuenta,
  onClose,
}: CuentaFormModalProps) {
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<CategoriaCuenta>('BASE_COP');
  const [moneda, setMoneda] = useState<MonedaCuenta>('COP');
  const [tipo, setTipo] = useState<TipoCuenta>('BANCO');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [aplica4x1000, setAplica4x1000] = useState(false);
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const editing = Boolean(cuenta);

  useEffect(() => {
    if (!open) return;

    if (cuenta) {
      setNombre(cuenta.nombre);
      setCategoria(cuenta.categoria);
      setMoneda(cuenta.moneda);
      setTipo(cuenta.tipo);
      setSaldoInicial('');
      setAplica4x1000(cuenta.aplica4x1000);
      setNotas(cuenta.notas ?? '');
      return;
    }

    setNombre('');
    setCategoria('BASE_COP');
    setMoneda('COP');
    setTipo('BANCO');
    setSaldoInicial('');
    setAplica4x1000(false);
    setNotas('');
  }, [open, cuenta]);

  useEffect(() => {
    if (categoria === 'BASE_COP') {
      setMoneda('COP');

      if (!tiposBaseCop.includes(tipo)) {
        setTipo('BANCO');
      }

      return;
    }

    if (categoria === 'OPERATIVA') {
      setAplica4x1000(false);

      if (moneda === 'COP') {
        setMoneda('BS');
      }

      if (!tiposOperativos.includes(tipo)) {
        setTipo('BILLETERA_BS');
      }
    }
  }, [categoria, moneda, tipo]);

  if (!open) return null;

  const tiposDisponibles =
    categoria === 'BASE_COP' ? tiposBaseCop : tiposOperativos;

  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!nombre.trim()) {
        alert('El nombre de la cuenta es obligatorio.');
        return;
      }

      if (editing && cuenta) {
        await api.patch(`/cuentas/${cuenta.id}`, {
          nombre: nombre.trim(),
          tipo,
          aplica4x1000,
          notas: notas.trim() || null,
        });
      } else {
        await api.post('/cuentas', {
          nombre: nombre.trim(),
          categoria,
          moneda,
          tipo,
          saldoInicial: parseFormattedNumber(saldoInicial) || 0,
          aplica4x1000,
          notas: notas.trim() || null,
        });
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert('No fue posible guardar la cuenta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {editing ? 'Editar cuenta' : 'Nueva cuenta'}
          </h2>

          <p className="text-sm text-gray-500">
            Configura la cuenta, moneda, categoría y si aplica 4x1000.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Nombre
            </span>

            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Bancolombia, Caja, Zelle..."
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Categoría
            </span>

            <select
              value={categoria}
              onChange={(event) =>
                setCategoria(event.target.value as CategoriaCuenta)
              }
              disabled={editing}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="BASE_COP">Base COP</option>
              <option value="OPERATIVA">Operativa</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Moneda
            </span>

            <select
              value={moneda}
              onChange={(event) =>
                setMoneda(event.target.value as MonedaCuenta)
              }
              disabled={editing || categoria === 'BASE_COP'}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
            >
              {categoria === 'BASE_COP' ? (
                <option value="COP">COP</option>
              ) : (
                <>
                  <option value="BS">BS</option>
                  <option value="USD">USD</option>
                  <option value="USDT">USDT</option>
                </>
              )}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Tipo
            </span>

            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as TipoCuenta)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {tiposDisponibles.map((tipoCuenta) => (
                <option key={tipoCuenta} value={tipoCuenta}>
                  {tipoCuenta}
                </option>
              ))}
            </select>
          </label>

          {!editing && (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Saldo inicial
              </span>
              <FormattedNumberInput
                value={saldoInicial}
                onChange={(value) => setSaldoInicial(value)}
                placeholder="Saldo Incial"
              />
              {/* <input
                type="number"
                min="0"
                value={saldoInicial}
                onChange={(event) => setSaldoInicial(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="0"
              /> */}
            </label>
          )}

          <label className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 md:col-span-2">
            <input
              type="checkbox"
              checked={aplica4x1000}
              onChange={(event) => setAplica4x1000(event.target.checked)}
              disabled={categoria !== 'BASE_COP' || moneda !== 'COP'}
              className="h-4 w-4 rounded border-gray-300"
            />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Aplica 4x1000
              </p>

              <p className="text-xs text-gray-500">
                Solo disponible para cuentas BASE_COP en COP.
              </p>
            </div>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Notas
            </span>

            <textarea
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Información adicional de la cuenta..."
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
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </section>
    </div>
  );
}