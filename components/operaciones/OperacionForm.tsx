'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';

import { api } from '@/lib/api';
import { formatMoney } from '@/lib/formatters';
import type {
  Cliente,
  Cuenta,
  Moneda,
  OrigenOperacion,
} from '@/types/operaciones';
import { FormattedNumberInput } from '../ui/FormattedNumberInput';
import { parseFormattedNumber } from '@/lib/number-format';

type OperacionFormProps = {
  clientes: Cliente[];
  cuentas: Cuenta[];
};

function roundCop(value: number) {
  return Math.round(value);
}

export function OperacionForm({ clientes, cuentas }: OperacionFormProps) {
  const router = useRouter();

  const [origenValue, setOrigenValue] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('BS');
  const [montoTransaccion, setMontoTransaccion] = useState('');
  const [tasaCompra, setTasaCompra] = useState('');
  const [tasaVenta, setTasaVenta] = useState('');
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const origenes = useMemo<OrigenOperacion[]>(() => {
    const cuentasOperativas = cuentas
      .filter((cuenta) => cuenta.estado === 'ACTIVO')
      .filter((cuenta) => cuenta.categoria === 'OPERATIVA')
      .map((cuenta) => ({
        tipo: 'CUENTA' as const,
        id: cuenta.id,
        nombre: cuenta.nombre,
        moneda: cuenta.moneda,
        saldo: cuenta.saldo,
      }));

    const clientesActivos = clientes
      .filter((cliente) => cliente.estado === 'ACTIVO')
      .map((cliente) => ({
        tipo: 'CLIENTE' as const,
        id: cliente.id,
        nombre: cliente.nombre,
      }));

    return [...cuentasOperativas, ...clientesActivos];
  }, [clientes, cuentas]);

  const selectedOrigen = useMemo(() => {
    return origenes.find(
      (origen) => `${origen.tipo}:${origen.id}` === origenValue,
    );
  }, [origenes, origenValue]);

  const selectedCliente = useMemo(() => {
    return clientes.find((cliente) => cliente.id === clienteId);
  }, [clientes, clienteId]);

  const preview = useMemo(() => {
    const monto = parseFormattedNumber(montoTransaccion) || 0;
    const tc = Number(tasaCompra || 0);
    const tv = Number(tasaVenta || 0);

    const totalCompraCop = roundCop(monto * tc);
    const totalVentaCop = roundCop(monto * tv);
    const utilidadCop = totalVentaCop - totalCompraCop;

    return {
      totalCompraCop,
      totalVentaCop,
      utilidadCop,
    };
  }, [montoTransaccion, tasaCompra, tasaVenta]);

  const montoNumber = parseFormattedNumber(montoTransaccion) || 0;
  const saldoInsuficiente =
     selectedOrigen?.tipo === 'CUENTA' && montoNumber > Number(selectedOrigen.saldo || 0);

  const operationMode = selectedOrigen?.tipo === 'CLIENTE'
    ? 'DIRECTA'
    : selectedOrigen?.tipo === 'CUENTA'
      ? 'VENTA'
      : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');

    if (!selectedOrigen) {
      setErrorMessage('Seleccione un origen/proveedor.');
      return;
    }

    if (!selectedCliente) {
      setErrorMessage('Seleccione un cliente.');
      return;
    }

    if (parseFormattedNumber(montoTransaccion) <= 0) {
      setErrorMessage('Ingrese un monto válido.');
      return;
    }

    if (Number(tasaCompra) <= 0 || Number(tasaVenta) <= 0) {
      setErrorMessage('Ingrese TC y TV válidas.');
      return;
    }

      if (selectedOrigen?.tipo === 'CUENTA' && montoNumber > Number(selectedOrigen.saldo || 0)) {
      setErrorMessage('Saldo insuficiente en la cuenta operativa.');
      return;
    }

    setSaving(true);

    try {
      const payload =
        selectedOrigen.tipo === 'CUENTA'
          ? {
              tipo: 'VENTA',
              nombre: `Venta a ${selectedCliente.nombre}`,
              deudorId: selectedCliente.id,
              cuentaOperativaId: selectedOrigen.id,
              monedaTransaccion: selectedOrigen.moneda,
              montoTransaccion: parseFormattedNumber(montoTransaccion),
              tasaCompra: Number(tasaCompra),
              tasaVenta: Number(tasaVenta),
              destinatario: selectedCliente.nombre,
              notas: nota || undefined,
            }
          : {
              tipo: 'OPERACION_DIRECTA',
              nombre: `Operación directa ${selectedOrigen.nombre} a ${selectedCliente.nombre}`,
              acreedorId: selectedOrigen.id,
              deudorId: selectedCliente.id,
              monedaTransaccion: moneda,
              montoTransaccion: parseFormattedNumber(montoTransaccion),
              tasaCompra: Number(tasaCompra),
              tasaVenta: Number(tasaVenta),
              destinatario: selectedCliente.nombre,
              notas: nota || undefined,
            };

      await api.post('/operaciones', payload);

      setOrigenValue('');
      setClienteId('');
      setMoneda('BS');
      setMontoTransaccion('');
      setTasaCompra('');
      setTasaVenta('');
      setNota('');

      router.refresh();
    } catch (error) {
      setErrorMessage('No fue posible registrar la operación.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Operaciones</h1>
        <p className="text-sm text-gray-500">
          Registra ventas desde cuentas operativas u operaciones directas.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Origen / proveedor
          </label>

          <select
            value={origenValue}
            onChange={(event) => setOrigenValue(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Seleccione origen</option>

            <optgroup label="Mis cuentas operativas">
              {origenes
                .filter((origen) => origen.tipo === 'CUENTA')
                .map((origen) => (
                  <option
                    key={`${origen.tipo}:${origen.id}`}
                    value={`${origen.tipo}:${origen.id}`}
                  >
                    {origen.nombre} - {origen.saldo} {origen.moneda}
                  </option>
                ))}
            </optgroup>

            <optgroup label="Clientes / proveedores">
              {origenes
                .filter((origen) => origen.tipo === 'CLIENTE')
                .map((origen) => (
                  <option
                    key={`${origen.tipo}:${origen.id}`}
                    value={`${origen.tipo}:${origen.id}`}
                  >
                    {origen.nombre}
                  </option>
                ))}
            </optgroup>
          </select>

          {operationMode && (
            <p className="mt-2 text-xs font-medium text-gray-500">
              {operationMode === 'VENTA'
                ? 'Venta normal: moverá saldo de una cuenta operativa.'
                : 'Operación directa: no moverá cuentas propias.'}
            </p>
          )}
        </div>

        <div className="lg:col-span-4">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Cliente
          </label>

          <select
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Seleccione cliente</option>

            {clientes
              .filter((cliente) => cliente.estado === 'ACTIVO')
              .map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
          </select>
        </div>

        <div className="lg:col-span-1">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Moneda
          </label>

          <select
            value={
              selectedOrigen?.tipo === 'CUENTA'
                ? selectedOrigen.moneda
                : moneda
            }
            disabled={selectedOrigen?.tipo === 'CUENTA'}
            onChange={(event) => setMoneda(event.target.value as Moneda)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="BS">BS</option>
            <option value="USD">USD</option>
            <option value="USDT">USDT</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Monto
          </label>

          {/* <input
            type="number"
            value={montoTransaccion}
            onChange={(event) => setMontoTransaccion(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="0"
          /> */}
          <FormattedNumberInput
            value={montoTransaccion}
            onChange={(value) => setMontoTransaccion(value)}
            placeholder="0"
          />
          
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Tasa Compra
          </label>

          <input
            type="number"
            step="0.0001"
            value={tasaCompra}
            onChange={(event) => setTasaCompra(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="0"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Total Compra
          </label>

          <input
            readOnly
            value={formatMoney(preview.totalCompraCop)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none"
          />
        </div>
        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Tasa Venta
          </label>

          <input
            type="number"
            step="0.0001"
            value={tasaVenta}
            onChange={(event) => setTasaVenta(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="0"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Total venta
          </label>

          <input
            readOnly
            value={formatMoney(preview.totalVentaCop)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Utilidad estimada
          </label>

          <input
            readOnly
            value={formatMoney(preview.utilidadCop)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-green-50 px-3 text-sm font-semibold text-green-700 outline-none"
          />
        </div>

        <div className="lg:col-span-6">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Nota
          </label>

          <input
            value={nota}
            onChange={(event) => setNota(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Nota de la operación"
          />
        </div>

        <div className="flex items-end lg:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-tr from-green-600 to-blue-400 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:shadow-blue-500/40 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiPlus className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </section>
  );
}