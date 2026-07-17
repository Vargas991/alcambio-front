'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { formatMoney } from '@/lib/formatters';
import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';
import type { TipoEntrada } from '@/types/entradas';

type EntradaFormModalProps = {
  open: boolean;
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
  initialDeudorId?: string;
  onClose: () => void;
};

export function EntradaFormModal({
  open,
  clientes,
  cuentas,
  initialDeudorId,
  onClose,
}: EntradaFormModalProps) {
  const router = useRouter();

  const [tipo, setTipo] = useState<TipoEntrada>('ABONO_CUENTA_PROPIA');
  const [deudorId, setDeudorId] = useState('');
  const [acreedorId, setAcreedorId] = useState('');
  const [cuentaId, setCuentaId] = useState('');
  const [montoCop, setMontoCop] = useState('');
  const [proveedorCobra4x1000, setProveedorCobra4x1000] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTipo('ABONO_CUENTA_PROPIA');
    setDeudorId(initialDeudorId ?? '');
    setAcreedorId('');
    setCuentaId('');
    setMontoCop('');
    setProveedorCobra4x1000(false);
    setDescripcion('');
    setReferencia('');
    setNotas('');
  }, [open, initialDeudorId]);

  const montoNumber = Number(montoCop || 0);

  const impuestoProveedor4x1000 = useMemo(() => {
    if (tipo !== 'ABONO_DIRECTO_PROVEEDOR') return 0;
    if (!proveedorCobra4x1000) return 0;

    return Math.round((montoNumber * 0.004 + Number.EPSILON) * 100) / 100;
  }, [tipo, proveedorCobra4x1000, montoNumber]);

  const netoAcreedor = useMemo(() => {
    if (tipo !== 'ABONO_DIRECTO_PROVEEDOR') return montoNumber;

    return Math.round(
      (montoNumber - impuestoProveedor4x1000 + Number.EPSILON) * 100,
    ) / 100;
  }, [tipo, montoNumber, impuestoProveedor4x1000]);

  if (!open) return null;

  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!deudorId) {
        alert('Debes seleccionar el deudor.');
        return;
      }

      if (!montoNumber || montoNumber <= 0) {
        alert('Debes indicar un monto mayor a 0.');
        return;
      }

      if (tipo === 'ABONO_CUENTA_PROPIA' && !cuentaId) {
        alert('Debes seleccionar la cuenta destino.');
        return;
      }

      if (tipo === 'ABONO_DIRECTO_PROVEEDOR' && !acreedorId) {
        alert('Debes seleccionar el acreedor.');
        return;
      }

      if (tipo === 'ABONO_DIRECTO_PROVEEDOR' && deudorId === acreedorId) {
        alert('El deudor y el acreedor no pueden ser la misma persona.');
        return;
      }

      await api.post('/entradas', {
        tipo,
        deudorId,
        acreedorId:
          tipo === 'ABONO_DIRECTO_PROVEEDOR' ? acreedorId : undefined,
        cuentaId: tipo === 'ABONO_CUENTA_PROPIA' ? cuentaId : undefined,
        montoCop: montoNumber,
        proveedorCobra4x1000:
          tipo === 'ABONO_DIRECTO_PROVEEDOR'
            ? proveedorCobra4x1000
            : false,
        descripcion: descripcion.trim() || null,
        referencia: referencia.trim() || null,
        notas: notas.trim() || null,
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert('No fue posible registrar la entrada.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Registrar entrada
          </h2>

          <p className="text-sm text-gray-500">
            Registra abonos a cuentas propias o pagos directos a acreedores.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Tipo de entrada
            </span>

            <select
              value={tipo}
              onChange={(event) => {
                const value = event.target.value as TipoEntrada;
                setTipo(value);
                setAcreedorId('');
                setCuentaId('');
                setProveedorCobra4x1000(false);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="ABONO_CUENTA_PROPIA">
                Abono a cuenta propia
              </option>
              <option value="ABONO_DIRECTO_PROVEEDOR">
                Abono directo a proveedor
              </option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Deudor
            </span>

            <select
              value={deudorId}
              onChange={(event) => setDeudorId(event.target.value)}
              disabled={Boolean(initialDeudorId)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </label>

          {tipo === 'ABONO_CUENTA_PROPIA' ? (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Cuenta destino
              </span>

              <select
                value={cuentaId}
                onChange={(event) => setCuentaId(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Selecciona una cuenta</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.nombre} · {cuenta.moneda}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Acreedor / proveedor
              </span>

              <select
                value={acreedorId}
                onChange={(event) => setAcreedorId(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Selecciona un acreedor</option>
                {clientes
                  .filter((cliente) => cliente.id !== deudorId)
                  .map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
              </select>
            </label>
          )}

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Monto COP
            </span>

            <input
              type="number"
              min="1"
              value={montoCop}
              onChange={(event) => setMontoCop(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="0"
            />
          </label>

          {tipo === 'ABONO_DIRECTO_PROVEEDOR' && (
            <label className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <input
                type="checkbox"
                checked={proveedorCobra4x1000}
                onChange={(event) =>
                  setProveedorCobra4x1000(event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Proveedor cobra 4x1000
                </p>

                <p className="text-xs text-gray-500">
                  Descuenta el 4x1000 del neto reconocido al acreedor.
                </p>
              </div>
            </label>
          )}

          {tipo === 'ABONO_DIRECTO_PROVEEDOR' && (
            <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Monto pagado
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatMoney(montoNumber)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    4x1000 proveedor
                  </p>
                  <p className="font-bold text-orange-700">
                    {formatMoney(impuestoProveedor4x1000)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Neto acreedor
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatMoney(netoAcreedor)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Referencia
            </span>

            <input
              type="text"
              value={referencia}
              onChange={(event) => setReferencia(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Comprobante, nota, referencia..."
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Descripción
            </span>

            <input
              type="text"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Pago recibido, abono directo..."
            />
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
              placeholder="Información adicional..."
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
            {submitting ? 'Registrando...' : 'Registrar entrada'}
          </button>
        </div>
      </section>
    </div>
  );
}