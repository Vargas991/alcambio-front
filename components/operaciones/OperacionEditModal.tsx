'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import { api } from '@/lib/api';
import { formatMoney } from '@/lib/formatters';
import {
  numberToInputValue,
  parseFormattedNumber,
} from '@/lib/number-format';

import { FormattedNumberInput } from '../ui/FormattedNumberInput';

import type {
  Cliente,
  Cuenta,
  Moneda,
  Operacion,
  OrigenOperacion,
} from '@/types/operaciones';

import type { PromedioCompraCuenta } from '@/types/cuentas';

type DestinoOperacion =
  | {
      tipo: 'CLIENTE';
      id: string;
      nombre: string;
    }
  | {
      tipo: 'CUENTA';
      id: string;
      nombre: string;
      moneda: Moneda;
      saldo: number | string;
    };

type OperacionEditModalProps = {
  open: boolean;
  onClose: () => void;
  operacion: Operacion;
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios?: PromedioCompraCuenta[];
};

function roundCop(value: number) {
  return Math.round(value);
}

function formatRate(value: number) {
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function OperacionEditModal({
  open,
  onClose,
  operacion,
  clientes,
  cuentas,
  promedios,
}: OperacionEditModalProps) {
  const router = useRouter();

  const origenInicial =
    operacion.tipo === 'VENTA' && operacion.cuentaOperativaId
      ? `CUENTA:${operacion.cuentaOperativaId}`
      : operacion.tipo === 'COMPRA' && operacion.acreedorId
        ? `CLIENTE:${operacion.acreedorId}`
        : operacion.tipo === 'OPERACION_DIRECTA' && operacion.acreedorId
          ? `CLIENTE:${operacion.acreedorId}`
          : '';

  const destinoInicial =
    operacion.tipo === 'VENTA' && operacion.deudorId
      ? `CLIENTE:${operacion.deudorId}`
      : operacion.tipo === 'COMPRA' && operacion.cuentaOperativaId
        ? `CUENTA:${operacion.cuentaOperativaId}`
        : operacion.tipo === 'OPERACION_DIRECTA' && operacion.deudorId
          ? `CLIENTE:${operacion.deudorId}`
          : '';

  const [origenValue, setOrigenValue] = useState(origenInicial);
  const [destinoValue, setDestinoValue] = useState(destinoInicial);
  const [moneda, setMoneda] = useState<Moneda>(operacion.monedaTransaccion);
  const [montoTransaccion, setMontoTransaccion] = useState(
    numberToInputValue(operacion.montoTransaccion),
  );
  const [tasaCompra, setTasaCompra] = useState(
    String(operacion.tasaCompra ?? ''),
  );
  const [tasaVenta, setTasaVenta] = useState(
    String(operacion.tasaVenta ?? ''),
  );
  const [nota, setNota] = useState(operacion.notas ?? '');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const promediosList =promedios ?? [];
  const promediosPorCuenta = useMemo(() => {
    return Object.fromEntries(
      promediosList.map((promedio) => [promedio.cuentaId, promedio]),
    );
  }, [promedios]);

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

  const destinos = useMemo<DestinoOperacion[]>(() => {
    const clientesActivos = clientes
      .filter((cliente) => cliente.estado === 'ACTIVO')
      .map((cliente) => ({
        tipo: 'CLIENTE' as const,
        id: cliente.id,
        nombre: cliente.nombre,
      }));

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

    return [...clientesActivos, ...cuentasOperativas];
  }, [clientes, cuentas]);

  const selectedOrigen = useMemo(() => {
    return origenes.find(
      (origen) => `${origen.tipo}:${origen.id}` === origenValue,
    );
  }, [origenes, origenValue]);

  const selectedDestino = useMemo(() => {
    return destinos.find(
      (destino) => `${destino.tipo}:${destino.id}` === destinoValue,
    );
  }, [destinos, destinoValue]);

  const operationMode =
    selectedOrigen?.tipo === 'CUENTA' && selectedDestino?.tipo === 'CLIENTE'
      ? 'VENTA'
      : selectedOrigen?.tipo === 'CLIENTE' && selectedDestino?.tipo === 'CUENTA'
        ? 'COMPRA'
        : selectedOrigen?.tipo === 'CLIENTE' &&
            selectedDestino?.tipo === 'CLIENTE'
          ? 'DIRECTA'
          : null;

  const monedaOperacion =
    operationMode === 'VENTA' && selectedOrigen?.tipo === 'CUENTA'
      ? selectedOrigen.moneda
      : operationMode === 'COMPRA' && selectedDestino?.tipo === 'CUENTA'
        ? selectedDestino.moneda
        : moneda;

  const cuentaOperativaSeleccionada =
    operationMode === 'VENTA' && selectedOrigen?.tipo === 'CUENTA'
      ? selectedOrigen
      : operationMode === 'COMPRA' && selectedDestino?.tipo === 'CUENTA'
        ? selectedDestino
        : undefined;

  const promedioCuentaSeleccionada = cuentaOperativaSeleccionada
    ? promediosPorCuenta[cuentaOperativaSeleccionada.id]
    : undefined;

  const preview = useMemo(() => {
    const monto = parseFormattedNumber(montoTransaccion) || 0;
    const tc = Number(tasaCompra) || 0;
    const tv = Number(tasaVenta) || 0;

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

  const saldoDisponibleParaEditar =
    operationMode === 'VENTA' && selectedOrigen?.tipo === 'CUENTA'
      ? Number(selectedOrigen.saldo || 0) +
        (operacion.tipo === 'VENTA' &&
        operacion.cuentaOperativaId === selectedOrigen.id
          ? Number(operacion.montoTransaccion || 0)
          : 0)
      : 0;

  const saldoInsuficiente =
    operationMode === 'VENTA' &&
    selectedOrigen?.tipo === 'CUENTA' &&
    montoNumber > saldoDisponibleParaEditar;

  const ventaPorDebajoDelPromedio =
    operationMode === 'VENTA' &&
    promedioCuentaSeleccionada &&
    parseFormattedNumber(tasaVenta) > 0 &&
    parseFormattedNumber(tasaVenta) < promedioCuentaSeleccionada.promedioCompra;

  function handleOrigenChange(value: string) {
    setOrigenValue(value);
    setErrorMessage('');

    const origen = origenes.find((item) => `${item.tipo}:${item.id}` === value);

    if (!origen) {
      return;
    }

    if (origen.tipo === 'CUENTA') {
      setMoneda(origen.moneda);

      const promedio = promediosPorCuenta[origen.id];

      if (promedio?.promedioCompra > 0) {
        setTasaCompra(String(promedio.promedioCompra));
      }

      return;
    }

    /**
     * Si origen es CLIENTE, puede ser COMPRA o DIRECTA.
     * En compra la cuenta destino define moneda.
     * En directa el usuario define moneda.
     */
  }

  function handleDestinoChange(value: string) {
    setDestinoValue(value);
    setErrorMessage('');

    const destino = destinos.find(
      (item) => `${item.tipo}:${item.id}` === value,
    );

    if (!destino) {
      return;
    }

    if (destino.tipo === 'CUENTA') {
      setMoneda(destino.moneda);

      /**
       * Si el destino es cuenta, el modo probable es COMPRA.
       * En compra la tasa compra la escribe el usuario.
       * La tasa venta se deja en 0 porque no aplica.
       */
      setTasaVenta('0');
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');

    if (!selectedOrigen) {
      setErrorMessage('Seleccione un origen/proveedor.');
      return;
    }

    if (!selectedDestino) {
      setErrorMessage('Seleccione un destino.');
      return;
    }

    if (!operationMode) {
      setErrorMessage('Seleccione una combinación válida de origen y destino.');
      return;
    }

    if (selectedOrigen.tipo === 'CUENTA' && selectedDestino.tipo === 'CUENTA') {
      setErrorMessage(
        'No puedes editar una operación de cuenta a cuenta desde este formulario.',
      );
      return;
    }

    const monto = parseFormattedNumber(montoTransaccion);
    const tc = Number(tasaCompra);
    const tv = Number(tasaVenta);

    if (monto <= 0) {
      setErrorMessage('Ingrese un monto válido.');
      return;
    }

    if (tc <= 0) {
      setErrorMessage('Ingrese una tasa de compra válida.');
      return;
    }

    if (operationMode !== 'COMPRA' && tv <= 0) {
      setErrorMessage('Ingrese una tasa de venta válida.');
      return;
    }

    if (
      operationMode === 'VENTA' &&
      selectedOrigen.tipo === 'CUENTA' &&
      monto > saldoDisponibleParaEditar
    ) {
      setErrorMessage('Saldo insuficiente en la cuenta operativa.');
      return;
    }

    setSaving(true);

    try {
      let payload:
        | {
            tipo: 'VENTA';
            nombre: string;
            deudorId: string;
            acreedorId: null;
            cuentaOperativaId: string;
            monedaTransaccion: Moneda;
            montoTransaccion: number;
            tasaCompra: number;
            tasaVenta: number;
            destinatario: string;
            notas?: string;
          }
        | {
            tipo: 'COMPRA';
            nombre: string;
            deudorId: null;
            acreedorId: string;
            cuentaOperativaId: string;
            monedaTransaccion: Moneda;
            montoTransaccion: number;
            tasaCompra: number;
            tasaVenta: number;
            destinatario: string;
            notas?: string;
          }
        | {
            tipo: 'OPERACION_DIRECTA';
            nombre: string;
            acreedorId: string;
            deudorId: string;
            cuentaOperativaId: null;
            monedaTransaccion: Moneda;
            montoTransaccion: number;
            tasaCompra: number;
            tasaVenta: number;
            destinatario: string;
            notas?: string;
          };

      if (operationMode === 'VENTA') {
        if (
          selectedOrigen.tipo !== 'CUENTA' ||
          selectedDestino.tipo !== 'CLIENTE'
        ) {
          setErrorMessage(
            'La venta requiere una cuenta de origen y un cliente destino.',
          );
          return;
        }

        payload = {
          tipo: 'VENTA',
          nombre: `Venta a ${selectedDestino.nombre}`,
          deudorId: selectedDestino.id,
          acreedorId: null,
          cuentaOperativaId: selectedOrigen.id,
          monedaTransaccion: selectedOrigen.moneda,
          montoTransaccion: monto,
          tasaCompra: tc,
          tasaVenta: tv,
          destinatario: selectedDestino.nombre,
          notas: nota || undefined,
        };
      } else if (operationMode === 'COMPRA') {
        if (
          selectedOrigen.tipo !== 'CLIENTE' ||
          selectedDestino.tipo !== 'CUENTA'
        ) {
          setErrorMessage(
            'La compra requiere un proveedor de origen y una cuenta destino.',
          );
          return;
        }

        payload = {
          tipo: 'COMPRA',
          nombre: `Compra a ${selectedOrigen.nombre}`,
          deudorId: null,
          acreedorId: selectedOrigen.id,
          cuentaOperativaId: selectedDestino.id,
          monedaTransaccion: selectedDestino.moneda,
          montoTransaccion: monto,
          tasaCompra: tc,
          tasaVenta: 1,
          destinatario: selectedDestino.nombre,
          notas: nota || undefined,
        };
      } else {
        if (
          selectedOrigen.tipo !== 'CLIENTE' ||
          selectedDestino.tipo !== 'CLIENTE'
        ) {
          setErrorMessage(
            'La operación directa requiere proveedor y cliente.',
          );
          return;
        }

        payload = {
          tipo: 'OPERACION_DIRECTA',
          nombre: `Operación directa ${selectedOrigen.nombre} a ${selectedDestino.nombre}`,
          acreedorId: selectedOrigen.id,
          deudorId: selectedDestino.id,
          cuentaOperativaId: null,
          monedaTransaccion: moneda,
          montoTransaccion: monto,
          tasaCompra: tc,
          tasaVenta: tv,
          destinatario: selectedDestino.nombre,
          notas: nota || undefined,
        };
      }

      await api.put(`/operaciones/${operacion.id}`, payload);

      router.refresh();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ??
            'No fue posible editar la operación.',
        );
      } else {
        setErrorMessage('No fue posible editar la operación.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Editar operación
            </h2>
            <p className="text-sm text-gray-500">{operacion.codigo}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cerrar
          </button>
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
              onChange={(event) => handleOrigenChange(event.target.value)}
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
          </div>

          <div className="lg:col-span-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Destino / cliente / cuenta
            </label>

            <select
              value={destinoValue}
              onChange={(event) => handleDestinoChange(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Seleccione destino</option>

              <optgroup label="Clientes">
                {destinos
                  .filter((destino) => destino.tipo === 'CLIENTE')
                  .map((destino) => (
                    <option
                      key={`${destino.tipo}:${destino.id}`}
                      value={`${destino.tipo}:${destino.id}`}
                    >
                      {destino.nombre}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Mis cuentas operativas">
                {destinos
                  .filter((destino) => destino.tipo === 'CUENTA')
                  .map((destino) => (
                    <option
                      key={`${destino.tipo}:${destino.id}`}
                      value={`${destino.tipo}:${destino.id}`}
                    >
                      {destino.nombre} - {destino.saldo} {destino.moneda}
                    </option>
                  ))}
              </optgroup>
            </select>

            {operationMode && (
              <p className="mt-2 text-xs font-medium text-gray-500">
                {operationMode === 'VENTA'
                  ? 'Venta: sale saldo de una cuenta operativa y el cliente queda debiendo.'
                  : operationMode === 'COMPRA'
                    ? 'Compra: entra saldo a una cuenta operativa y queda deuda con el proveedor.'
                    : 'Operación directa: no mueve cuentas propias.'}
              </p>
            )}
          </div>

          <div className="lg:col-span-1">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Moneda
            </label>

            <select
              value={monedaOperacion}
              disabled={operationMode === 'VENTA' || operationMode === 'COMPRA'}
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

            <FormattedNumberInput
              value={montoTransaccion}
              onChange={(value) => setMontoTransaccion(value)}
              placeholder="0"
            />

            {saldoInsuficiente && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                Saldo insuficiente. Disponible:{' '}
                {saldoDisponibleParaEditar.toLocaleString('es-CO')}{' '}
                {selectedOrigen?.tipo === 'CUENTA'
                  ? selectedOrigen.moneda
                  : ''}
              </p>
            )}
          </div>

          {promedioCuentaSeleccionada && operationMode === 'VENTA' && (
            <div className="lg:col-span-12">
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                <p>
                  Promedio de compra de la cuenta:{' '}
                  <strong>
                    {formatRate(promedioCuentaSeleccionada.promedioCompra)}
                  </strong>
                </p>
                <p>
                  Referencia mínima para vender sin perder. Si la tasa venta es
                  menor, puede generar pérdida.
                </p>
              </div>
            </div>
          )}

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

          {operationMode !== 'COMPRA' && (
            <>
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

                {ventaPorDebajoDelPromedio && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    Estás vendiendo por debajo del promedio de compra.
                  </p>
                )}
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
            </>
          )}

          {operationMode === 'COMPRA' && (
            <div className="lg:col-span-6">
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                <p className="font-semibold">Compra de saldo operativo</p>
                <p>
                  Esta operación aumentará el saldo de la cuenta destino y
                  registrará una deuda con el proveedor seleccionado.
                </p>
              </div>
            </div>
          )}

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

          <div className="flex items-end gap-3 lg:col-span-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || saldoInsuficiente}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-gradient-to-tr from-green-600 to-blue-400 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}