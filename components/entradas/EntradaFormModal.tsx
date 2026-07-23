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
  Entrada,
  TipoEntrada,
} from '@/types/entradas';

import { FormattedNumberInput } from '../ui/FormattedNumberInput';

type EntradaFormModalProps = {
  open: boolean;
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
  initialDeudorId?: string;
  entrada?: Entrada | null;
  onClose: () => void;
};

export function EntradaFormModal({
  open,
  clientes,
  cuentas,
  initialDeudorId,
  entrada,
  onClose,
}: EntradaFormModalProps) {
  const router = useRouter();

  const isEditing = Boolean(entrada);

  const [tipo, setTipo] =
    useState<TipoEntrada>('ABONO_CUENTA_PROPIA');

  const [deudorId, setDeudorId] =
    useState('');

  const [acreedorId, setAcreedorId] =
    useState('');

  const [cuentaId, setCuentaId] =
    useState('');

  const [montoCop, setMontoCop] =
    useState('');

  const [aplica4x1000, setAplica4x1000] =
    useState(false);

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

  useEffect(() => {
    if (!open) {
      return;
    }

    /**
     * EDITAR
     */
    if (entrada) {
      setTipo(entrada.tipo);

      setDeudorId(
        entrada.deudor?.id ?? '',
      );

      setAcreedorId(
        entrada.acreedor?.id ?? '',
      );

      setCuentaId(
        entrada.cuenta?.id ?? '',
      );

      setMontoCop(
        numberToInputValue(
          entrada.montoCop,
        ),
      );

      setAplica4x1000(
        entrada.aplica4x1000 ?? false,
      );

      setProveedorCobra4x1000(
        entrada.proveedorCobra4x1000 ??
          false,
      );

      setDescripcion(
        entrada.descripcion ?? '',
      );

      setReferencia(
        entrada.referencia ?? '',
      );

      setNotas(
        entrada.notas ?? '',
      );

      return;
    }

    /**
     * CREAR
     */
    setTipo('ABONO_CUENTA_PROPIA');

    setDeudorId(
      initialDeudorId ?? '',
    );

    setAcreedorId('');
    setCuentaId('');

    setMontoCop('');

    setAplica4x1000(false);

    setProveedorCobra4x1000(false);

    setDescripcion('');
    setReferencia('');
    setNotas('');
  }, [
    open,
    entrada,
    initialDeudorId,
  ]);

  const montoNumber =
    parseFormattedNumber(montoCop) || 0;

  /**
   * ============================
   * CUENTA PROPIA
   * ============================
   *
   * Ej:
   * entran 100.000
   * 4x1000 = 400
   * aplicado a deuda = 99.600
   */

  const impuestoCuentaPropia4x1000 =
    useMemo(() => {
      if (
        tipo !==
        'ABONO_CUENTA_PROPIA'
      ) {
        return 0;
      }

      if (!aplica4x1000) {
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
      aplica4x1000,
      montoNumber,
    ]);

  const montoAplicadoDeuda =
    useMemo(() => {
      if (
        tipo !==
        'ABONO_CUENTA_PROPIA'
      ) {
        return montoNumber;
      }

      return (
        Math.round(
          (
            montoNumber -
            impuestoCuentaPropia4x1000 +
            Number.EPSILON
          ) * 100,
        ) / 100
      );
    }, [
      tipo,
      montoNumber,
      impuestoCuentaPropia4x1000,
    ]);

  /**
   * ============================
   * DIRECTO PROVEEDOR
   * ============================
   */

  const impuestoProveedor4x1000 =
    useMemo(() => {
      if (
        tipo !==
        'ABONO_DIRECTO_PROVEEDOR'
      ) {
        return 0;
      }

      if (
        !proveedorCobra4x1000
      ) {
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

  const netoAcreedor =
    useMemo(() => {
      if (
        tipo !==
        'ABONO_DIRECTO_PROVEEDOR'
      ) {
        return montoNumber;
      }

      return (
        Math.round(
          (
            montoNumber -
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

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!deudorId) {
        alert(
          'Debes seleccionar el deudor.',
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
        tipo ===
          'ABONO_CUENTA_PROPIA' &&
        !cuentaId
      ) {
        alert(
          'Debes seleccionar la cuenta destino.',
        );
        return;
      }

      if (
        tipo ===
          'ABONO_DIRECTO_PROVEEDOR' &&
        !acreedorId
      ) {
        alert(
          'Debes seleccionar el acreedor.',
        );
        return;
      }

      if (
        tipo ===
          'ABONO_DIRECTO_PROVEEDOR' &&
        deudorId === acreedorId
      ) {
        alert(
          'El deudor y el acreedor no pueden ser la misma persona.',
        );
        return;
      }

      const payload = {
        tipo,

        deudorId,

        acreedorId:
          tipo ===
          'ABONO_DIRECTO_PROVEEDOR'
            ? acreedorId
            : undefined,

        cuentaId:
          tipo ===
          'ABONO_CUENTA_PROPIA'
            ? cuentaId
            : undefined,

        montoCop: montoNumber,

        aplica4x1000:
          tipo ===
          'ABONO_CUENTA_PROPIA'
            ? aplica4x1000
            : false,

        proveedorCobra4x1000:
          tipo ===
          'ABONO_DIRECTO_PROVEEDOR'
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
      if (entrada) {
        await api.put(
          `/entradas/${entrada.id}`,
          payload,
        );
      } else {
        await api.post(
          '/entradas',
          payload,
        );
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);

      alert(
        isEditing
          ? 'No fue posible editar la entrada.'
          : 'No fue posible registrar la entrada.',
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
              ? 'Editar entrada'
              : 'Registrar entrada'}
          </h2>

          <p className="text-sm text-gray-500">
            {isEditing
              ? 'Modifica los datos de la entrada seleccionada.'
              : 'Registra abonos a cuentas propias o pagos directos a acreedores.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          {/* TIPO */}
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Tipo de entrada
            </span>

            <select
              value={tipo}
              onChange={(event) => {
                const value =
                  event.target
                    .value as TipoEntrada;

                setTipo(value);

                setAcreedorId('');
                setCuentaId('');

                setAplica4x1000(false);

                setProveedorCobra4x1000(
                  false,
                );
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

          {/* DEUDOR */}
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Deudor
            </span>

            <select
              value={deudorId}
              onChange={(event) =>
                setDeudorId(
                  event.target.value,
                )
              }
              disabled={
                !isEditing &&
                Boolean(
                  initialDeudorId,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50"
            >
              <option value="">
                Selecciona un cliente
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

          {/* DESTINO */}
          {tipo ===
          'ABONO_CUENTA_PROPIA' ? (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Cuenta destino
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
                    </option>
                  ),
                )}
              </select>
            </label>
          ) : (
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
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  Selecciona un acreedor
                </option>

                {clientes
                  .filter(
                    (cliente) =>
                      cliente.id !==
                      deudorId,
                  )
                  .map(
                    (cliente) => (
                      <option
                        key={cliente.id}
                        value={
                          cliente.id
                        }
                      >
                        {
                          cliente.nombre
                        }
                      </option>
                    ),
                  )}
              </select>
            </label>
          )}

          {/* MONTO */}
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Monto COP
            </span>

            <FormattedNumberInput
              value={montoCop}
              onChange={(value) =>
                setMontoCop(value)
              }
              placeholder="Monto COP"
            />
          </label>

          {/* 4X1000 CUENTA PROPIA */}
          {tipo ===
            'ABONO_CUENTA_PROPIA' && (
            <label className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <input
                type="checkbox"
                checked={aplica4x1000}
                onChange={(event) =>
                  setAplica4x1000(
                    event.target
                      .checked,
                  )
                }
                className="h-4 w-4 rounded border-gray-300"
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Cobrar 4x1000
                </p>

                <p className="text-xs text-gray-500">
                  El monto entra completo
                  a la cuenta y el impuesto
                  se descuenta del abono
                  reconocido al cliente.
                </p>
              </div>
            </label>
          )}

          {/* RESUMEN CUENTA PROPIA */}
          {tipo ===
            'ABONO_CUENTA_PROPIA' && (
            <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
              <div className="grid gap-3 md:grid-cols-3">

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Entra a cuenta
                  </p>

                  <p className="font-bold text-gray-900">
                    {formatMoney(
                      montoNumber,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    4x1000
                  </p>

                  <p className="font-bold text-orange-700">
                    {formatMoney(
                      impuestoCuentaPropia4x1000,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Aplicado a deuda
                  </p>

                  <p className="font-bold text-gray-900">
                    {formatMoney(
                      montoAplicadoDeuda,
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4X1000 PROVEEDOR */}
          {tipo ===
            'ABONO_DIRECTO_PROVEEDOR' && (
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
                  Proveedor cobra
                  4x1000
                </p>

                <p className="text-xs text-gray-500">
                  Descuenta el 4x1000
                  del neto reconocido
                  al acreedor.
                </p>
              </div>
            </label>
          )}

          {/* RESUMEN PROVEEDOR */}
          {tipo ===
            'ABONO_DIRECTO_PROVEEDOR' && (
            <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
              <div className="grid gap-3 md:grid-cols-3">

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Monto pagado
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
                    Neto acreedor
                  </p>

                  <p className="font-bold text-gray-900">
                    {formatMoney(
                      netoAcreedor,
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REFERENCIA */}
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

          {/* DESCRIPCIÓN */}
          <label className="space-y-1">
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
              placeholder="Pago recibido, abono directo..."
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
                : 'Registrar entrada'}
          </button>
        </div>
      </section>
    </div>
  );
}