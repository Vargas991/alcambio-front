'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import { formatMoney } from '@/lib/formatters';
import {
  numberToInputValue,
  parseFormattedNumber,
} from '@/lib/number-format';

import type { ClienteResumenItem } from '@/types/clientes';
import type { Cuenta } from '@/types/cuentas';
import type {
  Salida,
  TipoSalida,
} from '@/types/salidas';

import { FormattedNumberInput } from '../ui/FormattedNumberInput';

type SalidaFormModalProps = {
  open: boolean;
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
  initialAcreedorId?: string;
  salida?: Salida | null;
  onClose: () => void;
};

export function SalidaFormModal({
  open,
  clientes,
  cuentas,
  initialAcreedorId,
  salida,
  onClose,
}: SalidaFormModalProps) {
  const router = useRouter();

  const isEditing = Boolean(salida);

  const [tipo, setTipo] =
    useState<TipoSalida>('PAGO_ACREEDOR');

  const [acreedorId, setAcreedorId] =
    useState('');

  const [cuentaId, setCuentaId] =
    useState('');

  const [montoCop, setMontoCop] =
    useState('');

  const [
    proveedorCobra4x1000,
    setProveedorCobra4x1000,
  ] = useState(false);

  const [descripcion, setDescripcion] =
    useState('');

  const [referencia, setReferencia] =
    useState('');

  const [notas, setNotas] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  /**
   * =====================================
   * CARGAR / LIMPIAR FORMULARIO
   * =====================================
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    /**
     * EDITAR
     */
    if (salida) {
      setTipo(salida.tipo);

      setAcreedorId(
        salida.acreedor?.id ?? '',
      );

      setCuentaId(
        salida.cuenta?.id ?? '',
      );

      /**
       * Importante:
       * en PAGO_ACREEDOR debemos cargar
       * montoBaseCop, no montoCop, porque
       * montoCop puede contener montoEnviadoCop.
       */
      setMontoCop(
        numberToInputValue(
          salida.montoBaseCop ??
            salida.montoCop,
        ),
      );

      setProveedorCobra4x1000(
        salida.proveedorCobra4x1000 ??
          false,
      );

      setDescripcion(
        salida.descripcion ?? '',
      );

      setReferencia(
        salida.referencia ?? '',
      );

      setNotas(
        salida.notas ?? '',
      );

      return;
    }

    /**
     * CREAR
     */
    setTipo('PAGO_ACREEDOR');

    setAcreedorId(
      initialAcreedorId ?? '',
    );

    setCuentaId('');
    setMontoCop('');

    setProveedorCobra4x1000(false);

    setDescripcion('');
    setReferencia('');
    setNotas('');
  }, [
    open,
    salida,
    initialAcreedorId,
  ]);

  /**
   * =====================================
   * CÁLCULOS
   * =====================================
   */

  const selectedCuenta = cuentas.find(
    (cuenta) => cuenta.id === cuentaId,
  );

  const montoNumber =
    parseFormattedNumber(montoCop) || 0;

  /**
   * 4x1000 que cobra el proveedor.
   *
   * Solo aplica a PAGO_ACREEDOR.
   */
  const impuestoProveedor4x1000 =
    useMemo(() => {
      if (
        tipo !== 'PAGO_ACREEDOR'
      ) {
        return 0;
      }

      if (!proveedorCobra4x1000) {
        return 0;
      }

      return (
        Math.round(
          (
            montoNumber * 0.004 +
            Number.EPSILON
          ) * 100,
        ) / 100
      );
    }, [
      tipo,
      proveedorCobra4x1000,
      montoNumber,
    ]);

  /**
   * Monto realmente enviado.
   *
   * Ejemplo:
   * monto base = 100.000
   * proveedor = 400
   *
   * enviado = 100.400
   */
  const montoEnviado =
    useMemo(() => {
      if (
        tipo !== 'PAGO_ACREEDOR'
      ) {
        return montoNumber;
      }

      return (
        Math.round(
          (
            montoNumber +
            impuestoProveedor4x1000 +
            Number.EPSILON
          ) * 100,
        ) / 100
      );
    }, [
      tipo,
      montoNumber,
      impuestoProveedor4x1000,
    ]);

  /**
   * 4x1000 de la cuenta propia.
   *
   * Se calcula sobre el monto enviado.
   */
  const impuestoCuenta4x1000 =
    useMemo(() => {
      if (
        !selectedCuenta?.aplica4x1000
      ) {
        return 0;
      }

      return (
        Math.round(
          (
            montoEnviado * 0.004 +
            Number.EPSILON
          ) * 100,
        ) / 100
      );
    }, [
      selectedCuenta,
      montoEnviado,
    ]);

  /**
   * Total que realmente sale de la cuenta.
   */
  const totalDebitado =
    useMemo(() => {
      return (
        Math.round(
          (
            montoEnviado +
            impuestoCuenta4x1000 +
            Number.EPSILON
          ) * 100,
        ) / 100
      );
    }, [
      montoEnviado,
      impuestoCuenta4x1000,
    ]);

  if (!open) {
    return null;
  }

  /**
   * =====================================
   * SUBMIT
   * =====================================
   */
  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!cuentaId) {
        alert(
          'Debes seleccionar la cuenta origen.',
        );
        return;
      }

      if (
        !montoNumber ||
        montoNumber <= 0
      ) {
        alert(
          'Debes indicar un monto mayor a 0.',
        );
        return;
      }

      if (
        tipo === 'PAGO_ACREEDOR' &&
        !acreedorId
      ) {
        alert(
          'Debes seleccionar el acreedor.',
        );
        return;
      }

      if (
        (
          tipo === 'GASTO' ||
          tipo === 'RETIRO'
        ) &&
        !descripcion.trim()
      ) {
        alert(
          'Debes indicar una descripción.',
        );
        return;
      }

      const payload = {
        tipo,

        acreedorId:
          tipo === 'PAGO_ACREEDOR'
            ? acreedorId
            : undefined,

        cuentaId,

        /**
         * Siempre mandamos monto base.
         *
         * El backend recalcula impuestos,
         * monto enviado y total debitado.
         */
        montoCop: montoNumber,

        proveedorCobra4x1000:
          tipo === 'PAGO_ACREEDOR'
            ? proveedorCobra4x1000
            : false,

        descripcion:
          descripcion.trim() || null,

        referencia:
          referencia.trim() || null,

        notas:
          notas.trim() || null,
      };

      /**
       * CREATE / UPDATE
       */
      if (salida) {
        await api.put(
          `/salidas/${salida.id}`,
          payload,
        );
      } else {
        await api.post(
          '/salidas',
          payload,
        );
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);

      alert(
        isEditing
          ? 'No fue posible editar la salida.'
          : 'No fue posible registrar la salida.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing
              ? 'Editar salida'
              : 'Registrar salida'}
          </h2>

          <p className="text-sm text-gray-500">
            {isEditing
              ? 'Modifica los datos de la salida seleccionada.'
              : 'Registra pagos a acreedores, gastos o retiros desde cuentas propias.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {/* TIPO */}
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Tipo de salida
            </span>

            <select
              value={tipo}
              onChange={(event) => {
                const value =
                  event.target
                    .value as TipoSalida;

                setTipo(value);

                setAcreedorId('');
                setProveedorCobra4x1000(
                  false,
                );
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="PAGO_ACREEDOR">
                Pago a acreedor
              </option>

              <option value="GASTO">
                Gasto
              </option>

              <option value="RETIRO">
                Retiro
              </option>
            </select>
          </label>

          {/* CUENTA */}
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Cuenta origen
            </span>

            <select
              value={cuentaId}
              onChange={(event) =>
                setCuentaId(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                Selecciona una cuenta
              </option>

              {cuentas.map(
                (cuenta) => (
                  <option
                    key={cuenta.id}
                    value={cuenta.id}
                  >
                    {cuenta.nombre} ·{' '}
                    {cuenta.moneda}

                    {cuenta.aplica4x1000
                      ? ' · 4x1000'
                      : ''}
                  </option>
                ),
              )}
            </select>
          </label>

          {/* ACREEDOR / REFERENCIA */}
          {tipo === 'PAGO_ACREEDOR' ? (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Acreedor / proveedor
              </span>

              <select
                value={acreedorId}
                onChange={(event) =>
                  setAcreedorId(
                    event.target.value,
                  )
                }
                disabled={
                  !isEditing &&
                  Boolean(
                    initialAcreedorId,
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
              >
                <option value="">
                  Selecciona un acreedor
                </option>

                {clientes.map(
                  (cliente) => (
                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >
                      {cliente.nombre}
                    </option>
                  ),
                )}
              </select>
            </label>
          ) : (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Referencia
              </span>

              <input
                type="text"
                value={referencia}
                onChange={(event) =>
                  setReferencia(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Comprobante, nota, referencia..."
              />
            </label>
          )}

          {/* MONTO */}
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Monto base COP
            </span>

            <FormattedNumberInput
              value={montoCop}
              onChange={(value) =>
                setMontoCop(value)
              }
              placeholder="Monto base COP"
            />
          </label>

          {/* 4X1000 PROVEEDOR */}
          {tipo === 'PAGO_ACREEDOR' && (
            <label className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <input
                type="checkbox"
                checked={
                  proveedorCobra4x1000
                }
                onChange={(event) =>
                  setProveedorCobra4x1000(
                    event.target
                      .checked,
                  )
                }
                className="h-4 w-4 rounded border-gray-300"
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Proveedor cobra 4x1000
                </p>

                <p className="text-xs text-gray-500">
                  Se suma al monto enviado al
                  acreedor.
                </p>
              </div>
            </label>
          )}

          {/* RESUMEN */}
          <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
            <div className="grid gap-3 md:grid-cols-4">

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Monto base
                </p>

                <p className="font-bold text-gray-900">
                  {formatMoney(
                    montoNumber,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  4x1000 proveedor
                </p>

                <p className="font-bold text-orange-700">
                  {formatMoney(
                    impuestoProveedor4x1000,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  4x1000 cuenta
                </p>

                <p className="font-bold text-orange-700">
                  {formatMoney(
                    impuestoCuenta4x1000,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Total debitado
                </p>

                <p className="font-bold text-gray-900">
                  {formatMoney(
                    totalDebitado,
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* REFERENCIA */}
          {tipo === 'PAGO_ACREEDOR' && (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Referencia
              </span>

              <input
                type="text"
                value={referencia}
                onChange={(event) =>
                  setReferencia(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Comprobante, nota, referencia..."
              />
            </label>
          )}

          {/* DESCRIPCIÓN */}
          <label
            className={[
              'space-y-1',
              tipo !== 'PAGO_ACREEDOR'
                ? 'md:col-span-2'
                : '',
            ].join(' ')}
          >
            <span className="text-xs font-semibold uppercase text-gray-500">
              Descripción
            </span>

            <input
              type="text"
              value={descripcion}
              onChange={(event) =>
                setDescripcion(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Pago proveedor, gasto operativo, retiro..."
            />
          </label>

          {/* NOTAS */}
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Notas
            </span>

            <textarea
              value={notas}
              onChange={(event) =>
                setNotas(
                  event.target.value,
                )
              }
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Información adicional..."
            />
          </label>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? isEditing
                ? 'Guardando...'
                : 'Registrando...'
              : isEditing
                ? 'Guardar cambios'
                : 'Registrar salida'}
          </button>
        </div>
      </section>
    </div>
  );
}