'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';
import {
  numberToInputValue,
  parseFormattedNumber,
} from '@/lib/number-format';

import type { ClienteResumenItem } from '@/types/clientes';
import type { Entrada, TipoEntrada } from '@/types/entradas';
import type { Cuenta, Moneda } from '@/types/operaciones';

import { FormattedNumberInput } from '../ui/FormattedNumberInput';

type BalanceClienteMoneda = {
  moneda: Moneda;
  totalDebitos?: number;
  totalCreditos?: number;
  saldo: number;
  estado?: string;
};

type EntradaFormModalProps = {
  open: boolean;
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
  balances?: BalanceClienteMoneda[];
  initialDeudorId?: string;
  entrada?: Entrada | null;
  onClose: () => void;
};

type EntradaMultimoneda = Entrada & {
  monedaPago?: Moneda | null;
  montoPago?: number | string | null;
  monedaAplicacion?: Moneda | null;
  montoAplicado?: number | string | null;
  tasaConversion?: number | string | null;
};

const MONEDAS: Moneda[] = ['COP', 'USD', 'USDT', 'BS'];

function formatAmount(value: number) {
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

function formatCurrency(value: number, moneda: Moneda) {
  return `${formatAmount(value)} ${moneda}`;
}

function normalizeNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}


/**
 * Define cómo se expresa visualmente la tasa para un par.
 *
 * No usa USD como intermediario si USD no participa en el par.
 *
 * Prioridad de referencia:
 * USD -> USDT -> COP -> BS
 *
 * Ejemplos:
 * USD/COP => 1 USD = X COP
 * USD/BS  => 1 USD = X BS
 * COP/BS  => 1 COP = X BS
 * USDT/COP => 1 USDT = X COP
 */
function getParTasa(
  monedaPago: Moneda,
  monedaDeuda: Moneda,
): {
  base: Moneda;
  quote: Moneda;
} {
  /**
   * Convenciones visibles estables.
   *
   * COP <-> BS:
   * 1 BS = X COP
   *
   * Esto deja:
   * - pago COP -> deuda BS: dividir
   * - pago BS  -> deuda COP: multiplicar
   *
   * Ejemplo tasa 3,5:
   * 10.000 COP / 3,5 = 2.857,14 BS
   * 10.000 BS * 3,5 = 35.000 COP
   */
  if (
    (monedaPago === 'COP' &&
      monedaDeuda === 'BS') ||
    (monedaPago === 'BS' &&
      monedaDeuda === 'COP')
  ) {
    return {
      base: 'BS',
      quote: 'COP',
    };
  }

  /**
   * USD <-> COP:
   * 1 USD = X COP
   */
  if (
    (monedaPago === 'USD' &&
      monedaDeuda === 'COP') ||
    (monedaPago === 'COP' &&
      monedaDeuda === 'USD')
  ) {
    return {
      base: 'USD',
      quote: 'COP',
    };
  }

  /**
   * USD <-> BS:
   * 1 USD = X BS
   */
  if (
    (monedaPago === 'USD' &&
      monedaDeuda === 'BS') ||
    (monedaPago === 'BS' &&
      monedaDeuda === 'USD')
  ) {
    return {
      base: 'USD',
      quote: 'BS',
    };
  }

  /**
   * USDT <-> COP:
   * 1 USDT = X COP
   */
  if (
    (monedaPago === 'USDT' &&
      monedaDeuda === 'COP') ||
    (monedaPago === 'COP' &&
      monedaDeuda === 'USDT')
  ) {
    return {
      base: 'USDT',
      quote: 'COP',
    };
  }

  /**
   * USDT <-> BS:
   * 1 USDT = X BS
   */
  if (
    (monedaPago === 'USDT' &&
      monedaDeuda === 'BS') ||
    (monedaPago === 'BS' &&
      monedaDeuda === 'USDT')
  ) {
    return {
      base: 'USDT',
      quote: 'BS',
    };
  }

  /**
   * USD <-> USDT:
   * 1 USD = X USDT
   */
  if (
    (monedaPago === 'USD' &&
      monedaDeuda === 'USDT') ||
    (monedaPago === 'USDT' &&
      monedaDeuda === 'USD')
  ) {
    return {
      base: 'USD',
      quote: 'USDT',
    };
  }

  return {
    base: monedaPago,
    quote: monedaDeuda,
  };
}

export function EntradaFormModal({
  open,
  clientes,
  cuentas,
  balances = [],
  initialDeudorId,
  entrada,
  onClose,
}: EntradaFormModalProps) {
  const router = useRouter();
  const isEditing = Boolean(entrada);

  const [tipo, setTipo] = useState<TipoEntrada>('ABONO_CUENTA_PROPIA');
  const [deudorId, setDeudorId] = useState('');
  const [acreedorId, setAcreedorId] = useState('');
  const [cuentaId, setCuentaId] = useState('');

  const [monedaPago, setMonedaPago] = useState<Moneda>('COP');
  const [montoPago, setMontoPago] = useState('');
  const [monedaAplicacion, setMonedaAplicacion] = useState<Moneda>('COP');

  /**
   * Tasa directa entre la moneda del abono y la moneda de la deuda.
   *
   * La etiqueta se genera según el par seleccionado.
   * Ejemplos:
   * - USD/COP -> 1 USD = 3.200 COP
   * - COP/BS  -> 1 COP = 3,5 BS
   */
  const [tasaConversion, setTasaConversion] = useState('');

  const [aplica4x1000, setAplica4x1000] = useState(false);
  const [proveedorCobra4x1000, setProveedorCobra4x1000] = useState(false);

  const [descripcion, setDescripcion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cuentasActivas = useMemo(
    () => cuentas.filter((cuenta) => cuenta.estado === 'ACTIVO'),
    [cuentas],
  );

  const monedasConCuenta = useMemo<Moneda[]>(() => {
    const values = new Set<Moneda>();

    cuentasActivas.forEach((cuenta) => {
      values.add(cuenta.moneda as Moneda);
    });

    return MONEDAS.filter((moneda) => values.has(moneda));
  }, [cuentasActivas]);

  /**
   * Monedas donde el cliente realmente tiene DEUDA por cobrar.
   *
   * Para registrar un abono no incluimos saldos negativos,
   * porque esos representan saldo a favor del cliente.
   *
   * Además, una moneda solo se considera utilizable si existe
   * al menos una cuenta activa en esa moneda dentro de la organización.
   */
  const monedasConDeuda = useMemo<Moneda[]>(() => {
    const monedasCuenta = new Set(monedasConCuenta);

    return MONEDAS.filter((moneda) => {
      if (!monedasCuenta.has(moneda)) {
        return false;
      }

      const balance = balances.find(
        (item) => item.moneda === moneda,
      );

      return normalizeNumber(balance?.saldo) > 0;
    });
  }, [balances, monedasConCuenta]);

  const monedasAplicables = useMemo<Moneda[]>(() => {
    if (monedasConDeuda.length > 0) {
      return monedasConDeuda;
    }

    /**
     * Fallback útil para registros históricos o cuando todavía
     * no se han cargado balances en el modal.
     */
    if (monedasConCuenta.length > 0) {
      return monedasConCuenta;
    }

    return MONEDAS;
  }, [monedasConDeuda, monedasConCuenta]);

  const cuentaSeleccionada = useMemo(
    () => cuentasActivas.find((cuenta) => cuenta.id === cuentaId) ?? null,
    [cuentasActivas, cuentaId],
  );

  const balanceAplicacion = useMemo(
    () => balances.find((balance) => balance.moneda === monedaAplicacion) ?? null,
    [balances, monedaAplicacion],
  );

  useEffect(() => {
    if (tipo !== 'ABONO_CUENTA_PROPIA' || !cuentaSeleccionada) {
      return;
    }

    /**
     * FLUJO CORRECTO:
     *
     * 1. Se elige primero la moneda de la deuda que se desea reducir.
     * 2. Luego se elige la cuenta donde realmente entra el dinero.
     * 3. La moneda de ESA CUENTA define monedaPago.
     *
     * Ejemplo:
     * deuda USD + cuenta Bancolombia COP
     * => monedaAplicacion = USD
     * => monedaPago = COP
     */
    setMonedaPago(
      cuentaSeleccionada.moneda as Moneda,
    );

    setTasaConversion('');

    /**
     * El 4x1000 solo puede existir si la cuenta receptora es COP.
     */
    if (cuentaSeleccionada.moneda !== 'COP') {
      setAplica4x1000(false);
    }
  }, [tipo, cuentaSeleccionada]);

  useEffect(() => {
    if (!open) return;

    if (entrada) {
      const actual = entrada as EntradaMultimoneda;

      setTipo(actual.tipo);
      setDeudorId(actual.deudor?.id ?? '');
      setAcreedorId(actual.acreedor?.id ?? '');
      setCuentaId(actual.cuenta?.id ?? '');

      const monedaPagoInicial =
        actual.monedaPago ??
        (actual.cuenta?.moneda as Moneda | undefined) ??
        'COP';

      const monedaAplicacionInicial = actual.monedaAplicacion ?? 'COP';
      const tasaBackend = normalizeNumber(actual.tasaConversion);

      setMonedaPago(monedaPagoInicial);
      setMontoPago(
        numberToInputValue(actual.montoPago ?? actual.montoCop ?? 0),
      );
      setMonedaAplicacion(monedaAplicacionInicial);

      /**
       * Para edición reutilizamos la tasa guardada.
       * La tasa guardada por backend está en convención interna
       * (monedaPago por 1 monedaAplicacion), por lo que la convertimos
       * a la tasa visible del par cuando sea posible.
       */
      const tasaGuardada =
        actual.tasaConversion !== null &&
        actual.tasaConversion !== undefined
          ? Number(actual.tasaConversion)
          : 0;

      if (
        monedaPagoInicial !== monedaAplicacionInicial &&
        tasaGuardada > 0
      ) {
        const { base, quote } = getParTasa(
          monedaPagoInicial,
          monedaAplicacionInicial,
        );

        const tasaVisible =
          monedaPagoInicial === base &&
          monedaAplicacionInicial === quote
            ? 1 / tasaGuardada
            : tasaGuardada;

        setTasaConversion(
          numberToInputValue(tasaVisible),
        );
      } else {
        setTasaConversion('');
      }

      setAplica4x1000(actual.aplica4x1000 ?? false);
      setProveedorCobra4x1000(actual.proveedorCobra4x1000 ?? false);
      setDescripcion(actual.descripcion ?? '');
      setReferencia(actual.referencia ?? '');
      setNotas(actual.notas ?? '');
      return;
    }

    setTipo('ABONO_CUENTA_PROPIA');
    setDeudorId(initialDeudorId ?? '');
    setAcreedorId('');
    setCuentaId('');
    setMonedaPago('COP');
    setMontoPago('');
    setMonedaAplicacion(monedasAplicables[0] ?? 'COP');
    setTasaConversion('');
    setAplica4x1000(false);
    setProveedorCobra4x1000(false);
    setDescripcion('');
    setReferencia('');
    setNotas('');
  }, [open, entrada, initialDeudorId, monedasAplicables]);

  useEffect(() => {
    if (!monedasAplicables.includes(monedaAplicacion)) {
      setMonedaAplicacion(monedasAplicables[0] ?? 'COP');
      setTasaConversion('');
    }
  }, [monedasAplicables, monedaAplicacion]);

  const montoPagoNumber =
    parseFormattedNumber(montoPago) || 0;

  const tasaConversionNumber =
    parseFormattedNumber(tasaConversion) || 0;

  const mismaMoneda =
    monedaPago === monedaAplicacion;

  const puedeAplicar4x1000Cuenta =
    tipo === 'ABONO_CUENTA_PROPIA' &&
    cuentaSeleccionada?.moneda === 'COP';

  const puedeAplicar4x1000Proveedor =
    tipo === 'ABONO_DIRECTO_PROVEEDOR' &&
    monedaPago === 'COP';

  const parTasa = useMemo(
    () =>
      getParTasa(
        monedaPago,
        monedaAplicacion,
      ),
    [
      monedaPago,
      monedaAplicacion,
    ],
  );

  /**
   * El backend espera:
   * unidades de monedaPago por 1 unidad
   * de monedaAplicacion.
   *
   * El formulario muestra una convención estable por par.
   *
   * Para BS/COP:
   * 1 BS = X COP
   *
   * - Pago BS -> deuda COP:
   *   multiplicamos.
   *
   * - Pago COP -> deuda BS:
   *   dividimos.
   */
  const tasaConversionBackend =
  useMemo(() => {
    if (mismaMoneda) {
      return 1;
    }

    if (tasaConversionNumber <= 0) {
      return 0;
    }

    const { base, quote } =
      parTasa;

    /**
     * Backend:
     * unidades monedaPago
     * por 1 monedaAplicacion.
     */

    if (
      monedaPago === base &&
      monedaAplicacion === quote
    ) {
      return (
        1 /
        tasaConversionNumber
      );
    }

    return tasaConversionNumber;
  }, [
    mismaMoneda,
    tasaConversionNumber,
    parTasa,
    monedaPago,
    monedaAplicacion,
  ]);

  const convertirPagoAAplicacion = (
  monto: number,
) => {
  if (monto <= 0) {
    return 0;
  }

  if (mismaMoneda) {
    return monto;
  }

  if (tasaConversionNumber <= 0) {
    return 0;
  }

  const { base, quote } = parTasa;

  /**
   * Si el pago está en la moneda BASE y
   * la deuda en la moneda QUOTE:
   * multiplicamos.
   *
   * Ejemplo BS -> COP:
   * 1 BS = 3,5 COP
   * 10.000 BS × 3,5 = 35.000 COP.
   */
  if (
    monedaPago === base &&
    monedaAplicacion === quote
  ) {
    return (
      monto *
      tasaConversionNumber
    );
  }

  /**
   * Sentido contrario:
   * dividimos.
   *
   * Ejemplo COP -> BS:
   * 1 BS = 3,5 COP
   * 10.000 COP ÷ 3,5 = 2.857,14 BS.
   */
  return (
    monto /
    tasaConversionNumber
  );
};

  /**
   * 4x1000:
   * se calcula sobre el dinero que realmente
   * entra a la cuenta COP.
   *
   * Luego el neto reconocido se convierte
   * a la moneda de la deuda.
   */
  const impuestoCuentaPropia4x1000 =
    useMemo(() => {
      if (
        tipo !==
          'ABONO_CUENTA_PROPIA' ||
        !aplica4x1000 ||
        !puedeAplicar4x1000Cuenta
      ) {
        return 0;
      }

      return (
        Math.round(
          (
            montoPagoNumber *
              0.004 +
            Number.EPSILON
          ) *
            100,
        ) / 100
      );
    }, [
      tipo,
      aplica4x1000,
      puedeAplicar4x1000Cuenta,
      montoPagoNumber,
    ]);

  const montoPagoNetoCuentaPropia =
    Math.max(
      0,
      montoPagoNumber -
        impuestoCuentaPropia4x1000,
    );

  const montoAplicadoCuentaPropia =
    useMemo(
      () =>
        convertirPagoAAplicacion(
          montoPagoNetoCuentaPropia,
        ),
      [
        montoPagoNetoCuentaPropia,
        mismaMoneda,
        tasaConversionNumber,
        parTasa,
      ],
    );

  const impuestoProveedor4x1000 = useMemo(() => {
    if (
      tipo !== 'ABONO_DIRECTO_PROVEEDOR' ||
      !proveedorCobra4x1000 ||
      !puedeAplicar4x1000Proveedor
    ) {
      return 0;
    }

    return Math.round((montoPagoNumber * 0.004 + Number.EPSILON) * 100) / 100;
  }, [tipo, proveedorCobra4x1000, puedeAplicar4x1000Proveedor, montoPagoNumber]);


  const montoNetoProveedor = Math.max(
    0,
    montoPagoNumber - impuestoProveedor4x1000,
  );

  const montoAplicadoDeudorDirecto = useMemo(
    () => convertirPagoAAplicacion(montoPagoNumber),
    [montoPagoNumber, mismaMoneda, tasaConversionBackend],
  );

  const montoAplicadoAcreedorDirecto = useMemo(
    () => convertirPagoAAplicacion(montoNetoProveedor),
    [montoNetoProveedor, mismaMoneda, tasaConversionBackend],
  );

  if (!open) return null;

  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!deudorId) {
        alert('Debes seleccionar el deudor.');
        return;
      }

      if (!montoPagoNumber || montoPagoNumber <= 0) {
        alert('Debes indicar un monto mayor a 0.');
        return;
      }

      if (tipo === 'ABONO_CUENTA_PROPIA' && !cuentaId) {
        alert('Debes seleccionar la cuenta destino.');
        return;
      }

      if (
        tipo === 'ABONO_CUENTA_PROPIA' &&
        cuentaSeleccionada &&
        cuentaSeleccionada.moneda !== monedaPago
      ) {
        alert(
          'La moneda del abono debe coincidir con la moneda de la cuenta destino.',
        );
        return;
      }

      if (tipo === 'ABONO_DIRECTO_PROVEEDOR' && !acreedorId) {
        alert('Debes seleccionar el acreedor.');
        return;
      }

      if (
        tipo === 'ABONO_DIRECTO_PROVEEDOR' &&
        deudorId === acreedorId
      ) {
        alert('El deudor y el acreedor no pueden ser la misma persona.');
        return;
      }

      if (
        !mismaMoneda &&
        tasaConversionNumber <= 0
      ) {
        alert(
          `Indica una tasa válida: 1 ${parTasa.base} = ? ${parTasa.quote}.`,
        );
        return;
      }

      if (
        !mismaMoneda &&
        tasaConversionBackend <= 0
      ) {
        alert(
          'No fue posible calcular una tasa de conversión válida.',
        );
        return;
      }

      if (
        aplica4x1000 &&
        cuentaSeleccionada?.moneda !== 'COP'
      ) {
        alert('El 4x1000 solo puede aplicarse a cuentas en COP.');
        return;
      }

      if (proveedorCobra4x1000 && monedaPago !== 'COP') {
        alert(
          'El 4x1000 del proveedor solo puede aplicarse cuando el pago es en COP.',
        );
        return;
      }

      const payload = {
        tipo,
        deudorId,
        acreedorId:
          tipo === 'ABONO_DIRECTO_PROVEEDOR' ? acreedorId : undefined,
        cuentaId: tipo === 'ABONO_CUENTA_PROPIA' ? cuentaId : undefined,

        monedaPago,
        montoPago: montoPagoNumber,
        monedaAplicacion,

        /**
         * Enviamos la tasa efectiva que espera el backend, aunque el usuario
         * siempre capture las cotizaciones con USD como base.
         */
        tasaConversion: mismaMoneda ? undefined : tasaConversionBackend,

        // Compatibilidad temporal con DTO/campos legados.
        montoCop: monedaPago === 'COP' ? montoPagoNumber : undefined,

        aplica4x1000:
          tipo === 'ABONO_CUENTA_PROPIA' ? aplica4x1000 : false,
        proveedorCobra4x1000:
          tipo === 'ABONO_DIRECTO_PROVEEDOR'
            ? proveedorCobra4x1000
            : false,

        descripcion: descripcion.trim() || null,
        referencia: referencia.trim() || null,
        notas: notas.trim() || null,
      };

      if (entrada) {
        await api.put(`/entradas/${entrada.id}`, payload);
      } else {
        await api.post('/entradas', payload);
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
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Editar entrada' : 'Registrar entrada'}
          </h2>
          <p className="text-sm text-gray-500">
            Registra el dinero recibido y aplícalo a la deuda del cliente en la
            misma moneda o mediante una tasa directa entre ambas monedas.
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
                setMonedaPago('COP');
                setTasaConversion('');
                setAplica4x1000(false);
                setProveedorCobra4x1000(false);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="ABONO_CUENTA_PROPIA">Abono a cuenta propia</option>
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
              disabled={!isEditing && Boolean(initialDeudorId)}
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

          {/* DEUDA A REDUCIR */}
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Deuda a reducir
            </span>

            <select
              value={monedaAplicacion}
              onChange={(event) => {
                setMonedaAplicacion(
                  event.target.value as Moneda,
                );
                setTasaConversion('');
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {monedasAplicables.map((moneda) => {
                const balance = balances.find(
                  (item) =>
                    item.moneda === moneda,
                );

                const saldo =
                  normalizeNumber(
                    balance?.saldo,
                  );

                return (
                  <option
                    key={moneda}
                    value={moneda}
                  >
                    {moneda}
                    {saldo > 0
                      ? ` · debe ${formatAmount(saldo)} ${moneda}`
                      : ''}
                  </option>
                );
              })}
            </select>

            {balanceAplicacion && (
              <p className="text-xs text-gray-500">
                Saldo por cobrar:{' '}
                {formatCurrency(
                  Math.max(
                    0,
                    normalizeNumber(
                      balanceAplicacion.saldo,
                    ),
                  ),
                  monedaAplicacion,
                )}
              </p>
            )}
          </label>

          {tipo === 'ABONO_CUENTA_PROPIA' ? (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Cuenta destino
              </span>

              <select
                value={cuentaId}
                onChange={(event) => {
                  setCuentaId(
                    event.target.value,
                  );
                  setTasaConversion('');
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  Selecciona una cuenta
                </option>

                {cuentasActivas.map(
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

              <p className="text-xs text-gray-500">
                La moneda de esta cuenta define
                la moneda en la que se recibe el abono.
              </p>
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

          {/* MONEDA DEL ABONO */}
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Moneda del abono
            </span>

            {tipo ===
            'ABONO_CUENTA_PROPIA' ? (
              <div className="flex h-[38px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">
                {cuentaSeleccionada
                  ? `${monedaPago} · definida por la cuenta`
                  : 'Selecciona una cuenta'}
              </div>
            ) : (
              <select
                value={monedaPago}
                onChange={(event) => {
                  const value =
                    event.target
                      .value as Moneda;

                  setMonedaPago(value);
                  setTasaConversion('');

                  if (value !== 'COP') {
                    setProveedorCobra4x1000(
                      false,
                    );
                  }
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {MONEDAS.map(
                  (moneda) => (
                    <option
                      key={moneda}
                      value={moneda}
                    >
                      {moneda}
                    </option>
                  ),
                )}
              </select>
            )}
          </label>

          {/* MONTO QUE REALMENTE ENTRA A LA CUENTA */}
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Monto abonado
            </span>

            <FormattedNumberInput
              value={montoPago}
              onChange={setMontoPago}
              placeholder={
                cuentaSeleccionada
                  ? `Monto en ${monedaPago}`
                  : 'Selecciona una cuenta'
              }
            />

            {tipo ===
              'ABONO_CUENTA_PROPIA' &&
              cuentaSeleccionada && (
                <p className="text-xs text-gray-500">
                  Este monto entra a{' '}
                  {cuentaSeleccionada.nombre}{' '}
                  en {monedaPago}.
                </p>
              )}
          </label>

          {!mismaMoneda && (
            <>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Tasa
                </span>

                <FormattedNumberInput
                  value={tasaConversion}
                  onChange={setTasaConversion}
                  placeholder={`1 ${parTasa.base} = ? ${parTasa.quote}`}
                />

                <p className="text-xs text-gray-500">
                  1 {parTasa.base} ={' '}
                  {tasaConversionNumber > 0
                    ? formatAmount(
                        tasaConversionNumber,
                      )
                    : '?'}{' '}
                  {parTasa.quote}
                </p>
              </label>

              {tasaConversionNumber > 0 && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 md:col-span-2">
                  <p className="text-xs font-semibold uppercase text-blue-600">
                    Conversión calculada
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-900">
                    {formatCurrency(
                      montoPagoNumber,
                      monedaPago,
                    )}{' '}
                    →{' '}
                    {formatCurrency(
                      convertirPagoAAplicacion(
                        montoPagoNumber,
                      ),
                      monedaAplicacion,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-blue-700">
                    {monedaPago ===
                      parTasa.base &&
                    monedaAplicacion ===
                      parTasa.quote
                      ? `${formatAmount(
                          montoPagoNumber,
                        )} ${monedaPago} × ${formatAmount(
                          tasaConversionNumber,
                        )} = ${formatAmount(
                          convertirPagoAAplicacion(
                            montoPagoNumber,
                          ),
                        )} ${monedaAplicacion}`
                      : `${formatAmount(
                          montoPagoNumber,
                        )} ${monedaPago} ÷ ${formatAmount(
                          tasaConversionNumber,
                        )} = ${formatAmount(
                          convertirPagoAAplicacion(
                            montoPagoNumber,
                          ),
                        )} ${monedaAplicacion}`}
                  </p>
                </div>
              )}
            </>
          )}

          {tipo === 'ABONO_CUENTA_PROPIA' && puedeAplicar4x1000Cuenta && (
            <label className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 md:col-span-2">
              <input
                type="checkbox"
                checked={aplica4x1000}
                onChange={(event) => setAplica4x1000(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Cobrar 4x1000
                </p>
                <p className="text-xs text-gray-500">
                  Disponible porque la cuenta seleccionada está en COP.
                </p>
              </div>
            </label>
          )}

          {tipo === 'ABONO_DIRECTO_PROVEEDOR' && puedeAplicar4x1000Proveedor && (
            <label className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 md:col-span-2">
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
                  Solo aplica cuando el pago directo está expresado en COP.
                </p>
              </div>
            </label>
          )}

          {tipo === 'ABONO_CUENTA_PROPIA' && (
            <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Recibido
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatCurrency(montoPagoNumber, monedaPago)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    4x1000
                  </p>
                  <p className="font-bold text-orange-700">
                    {formatCurrency(impuestoCuentaPropia4x1000, 'COP')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Conversión
                  </p>
                  <p className="font-bold text-gray-900">
                    {mismaMoneda
                      ? 'Misma moneda'
                      : tasaConversionNumber > 0
                        ? `1 ${parTasa.base} = ${formatAmount(tasaConversionNumber)} ${parTasa.quote}`
                        : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Aplicado a deuda
                  </p>
                  <p className="font-bold text-blue-700">
                    {formatCurrency(montoAplicadoCuentaPropia, monedaAplicacion)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tipo === 'ABONO_DIRECTO_PROVEEDOR' && (
            <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Pagado
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatCurrency(montoPagoNumber, monedaPago)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    4x1000
                  </p>
                  <p className="font-bold text-orange-700">
                    {formatCurrency(impuestoProveedor4x1000, 'COP')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Aplicado deudor
                  </p>
                  <p className="font-bold text-blue-700">
                    {formatCurrency(montoAplicadoDeudorDirecto, monedaAplicacion)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Reconocido acreedor
                  </p>
                  <p className="font-bold text-gray-900">
                    {formatCurrency(montoAplicadoAcreedorDirecto, monedaAplicacion)}
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