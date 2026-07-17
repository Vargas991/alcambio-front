'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/formatters';
import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';

type OperacionCompraModalProps = {
  open: boolean;
  cuenta: Cuenta;
  clientes: ClienteResumenItem[];
  onClose: () => void;
};

export function OperacionCompraModal({
  open,
  cuenta,
  clientes,
  onClose,
}: OperacionCompraModalProps) {
  const router = useRouter();

  const [acreedorId, setAcreedorId] = useState('');
  const [nombre, setNombre] = useState('');
  const [montoTransaccion, setMontoTransaccion] = useState('');
  const [tasaCompra, setTasaCompra] = useState('');
  const [referencia, setReferencia] = useState('');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const montoNumber = Number(montoTransaccion || 0);
  const tasaCompraNumber = Number(tasaCompra || 0);

  const totalCompraCop = useMemo(() => {
    return montoNumber * tasaCompraNumber;
  }, [montoNumber, tasaCompraNumber]);

  if (!open) return null;

  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!acreedorId) {
        alert('Debes seleccionar el proveedor / acreedor.');
        return;
      }

      if (!montoNumber || montoNumber <= 0) {
        alert('Debes indicar un monto comprado mayor a 0.');
        return;
      }

      if (!tasaCompraNumber || tasaCompraNumber <= 0) {
        alert('Debes indicar una tasa de compra válida.');
        return;
      }

      await api.post('/operaciones', {
        nombre:
          nombre.trim() ||
          `COMPRA ${cuenta.moneda} en ${cuenta.nombre}`,

        tipo: 'COMPRA',
        acreedorId,
        cuentaOperativaId: cuenta.id,
        
        monedaTransaccion: cuenta.moneda,
        montoTransaccion: montoNumber,
        tasaCompra: tasaCompraNumber,
        tasaVenta: 1,
        destinatario: cuenta.nombre,
        // referencia: referencia.trim() || null,
        notas: notas.trim() || null,
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert('No fue posible registrar la compra.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Registrar compra
          </h2>

          <p className="text-sm text-gray-500">
            La divisa comprada entrará directamente a la cuenta operativa.
          </p>
        </div>

        <div className="mb-5 rounded-lg bg-blue-50 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-500">
                Cuenta destino
              </p>
              <p className="font-bold text-blue-950">{cuenta.nombre}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-blue-500">
                Moneda
              </p>
              <p className="font-bold text-blue-950">{cuenta.moneda}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-blue-500">
                Saldo actual
              </p>
              <p className="font-bold text-blue-950">
                {formatNumber(cuenta.saldo)} {cuenta.moneda}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Proveedor / acreedor
            </span>

            <select
              value={acreedorId}
              onChange={(event) => setAcreedorId(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Selecciona un proveedor</option>

              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Nombre de la operación
            </span>

            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder={`COMPRA ${cuenta.moneda} a proveedor`}
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Monto comprado
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={montoTransaccion}
              onChange={(event) => setMontoTransaccion(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="0"
            />

            <p className="text-xs text-gray-400">
              Monto en {cuenta.moneda}.
            </p>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Tasa compra
            </span>

            <input
              type="number"
              min="0"
              step="0.0001"
              value={tasaCompra}
              onChange={(event) => setTasaCompra(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="0"
            />

            <p className="text-xs text-gray-400">
              Valor en COP por cada {cuenta.moneda}.
            </p>
          </label>

          <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Monto comprado
                </p>
                <p className="font-bold text-gray-900">
                  {formatNumber(montoNumber)} {cuenta.moneda}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Tasa compra
                </p>
                <p className="font-bold text-gray-900">
                  {formatMoney(tasaCompraNumber)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Total deuda COP
                </p>
                <p className="font-bold text-gray-900">
                  {formatMoney(totalCompraCop)}
                </p>
              </div>
            </div>
          </div>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Referencia
            </span>

            <input
              type="text"
              value={referencia}
              onChange={(event) => setReferencia(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Comprobante, nota o referencia"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Notas
            </span>

            <input
              type="text"
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Notas adicionales"
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
            {submitting ? 'Registrando...' : 'Registrar compra'}
          </button>
        </div>
      </section>
    </div>
  );
}