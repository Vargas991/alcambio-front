"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import {
  numberToInputValue,
  parseFormattedNumber,
} from "@/lib/number-format";

import type { ClienteResumenItem } from "@/types/clientes";
import type {
  Salida,
  TipoSalida,
} from "@/types/salidas";
import type { Cuenta } from "@/types/cuentas";
import type { Moneda } from "@/types/operaciones";

import { FormattedNumberInput } from "../ui/FormattedNumberInput";

type SalidaFormModalProps = {
  open: boolean;
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
  initialAcreedorId?: string;
  salida?: Salida | null;
  onClose: () => void;
};

type SalidaMultimoneda = Salida & {
  monedaPago?: Moneda | null;
  montoPago?: number | string | null;
  monedaAplicacion?: Moneda | null;
  montoAplicado?: number | string | null;
  tasaConversion?: number | string | null;
};

const MONEDAS: Moneda[] = [
  "COP",
  "USD",
  "USDT",
  "BS",
];

function formatAmount(value: number) {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

function formatCurrency(
  value: number,
  moneda: Moneda,
) {
  return `${formatAmount(value)} ${moneda}`;
}

/**
 * Convención visual estable por par.
 *
 * IMPORTANTE:
 * Esta es solamente la tasa que ve/captura el usuario.
 *
 * El backend recibe otra convención:
 * unidades de monedaPago por 1 monedaAplicacion.
 */
function getParTasa(
  monedaPago: Moneda,
  monedaDeuda: Moneda,
): {
  base: Moneda;
  quote: Moneda;
} {
  /**
   * BS <-> COP
   * 1 BS = X COP
   */
  if (
    (monedaPago === "BS" &&
      monedaDeuda === "COP") ||
    (monedaPago === "COP" &&
      monedaDeuda === "BS")
  ) {
    return {
      base: "BS",
      quote: "COP",
    };
  }

  /**
   * USD <-> COP
   * 1 USD = X COP
   */
  if (
    (monedaPago === "USD" &&
      monedaDeuda === "COP") ||
    (monedaPago === "COP" &&
      monedaDeuda === "USD")
  ) {
    return {
      base: "USD",
      quote: "COP",
    };
  }

  /**
   * USD <-> BS
   * 1 USD = X BS
   */
  if (
    (monedaPago === "USD" &&
      monedaDeuda === "BS") ||
    (monedaPago === "BS" &&
      monedaDeuda === "USD")
  ) {
    return {
      base: "USD",
      quote: "BS",
    };
  }

  /**
   * USDT <-> COP
   * 1 USDT = X COP
   */
  if (
    (monedaPago === "USDT" &&
      monedaDeuda === "COP") ||
    (monedaPago === "COP" &&
      monedaDeuda === "USDT")
  ) {
    return {
      base: "USDT",
      quote: "COP",
    };
  }

  /**
   * USDT <-> BS
   * 1 USDT = X BS
   */
  if (
    (monedaPago === "USDT" &&
      monedaDeuda === "BS") ||
    (monedaPago === "BS" &&
      monedaDeuda === "USDT")
  ) {
    return {
      base: "USDT",
      quote: "BS",
    };
  }

  /**
   * USD <-> USDT
   * 1 USD = X USDT
   */
  if (
    (monedaPago === "USD" &&
      monedaDeuda === "USDT") ||
    (monedaPago === "USDT" &&
      monedaDeuda === "USD")
  ) {
    return {
      base: "USD",
      quote: "USDT",
    };
  }

  return {
    base: monedaPago,
    quote: monedaDeuda,
  };
}

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
    useState<TipoSalida>("PAGO_ACREEDOR");

  const [acreedorId, setAcreedorId] =
    useState("");

  const [cuentaId, setCuentaId] =
    useState("");

  /**
   * Monto BASE expresado en la moneda
   * de la cuenta origen.
   *
   * El backend calcula:
   * - 4x1000 proveedor
   * - 4x1000 cuenta
   * - total realmente debitado
   */
  const [montoPago, setMontoPago] =
    useState("");

  /**
   * Solo aplica para PAGO_ACREEDOR:
   * moneda de la deuda que se desea reducir.
   */
  const [
    monedaAplicacion,
    setMonedaAplicacion,
  ] = useState<Moneda>("COP");

  /**
   * Tasa VISIBLE capturada por el usuario.
   * Se transforma antes de enviarse al backend.
   */
  const [
    tasaConversion,
    setTasaConversion,
  ] = useState("");

  const [
    proveedorCobra4x1000,
    setProveedorCobra4x1000,
  ] = useState(false);

  const [descripcion, setDescripcion] =
    useState("");

  const [referencia, setReferencia] =
    useState("");

  const [notas, setNotas] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const cuentasActivas = useMemo(
    () =>
      cuentas.filter(
        (cuenta) =>
          !cuenta.estado ||
          cuenta.estado === "ACTIVO",
      ),
    [cuentas],
  );

  const selectedCuenta = useMemo(
    () =>
      cuentasActivas.find(
        (cuenta) =>
          cuenta.id === cuentaId,
      ) ?? null,
    [
      cuentasActivas,
      cuentaId,
    ],
  );

  const monedaPago =
    (selectedCuenta?.moneda ??
      "COP") as Moneda;

  /**
   * =====================================
   * CARGAR / LIMPIAR FORMULARIO
   * =====================================
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (salida) {
      const actual =
        salida as SalidaMultimoneda;

      setTipo(salida.tipo);

      setAcreedorId(
        salida.acreedor?.id ?? "",
      );

      setCuentaId(
        salida.cuenta?.id ?? "",
      );

      /**
       * Para registros nuevos usamos montoPago.
       *
       * Para registros históricos COP:
       * montoBaseCop sigue siendo el mejor fallback,
       * porque montoCop podía contener montoEnviadoCop.
       */
      setMontoPago(
        numberToInputValue(
          actual.montoPago ??
            salida.montoBaseCop ??
            salida.montoCop,
        ),
      );

      setMonedaAplicacion(
        (actual.monedaAplicacion ??
          salida.cuenta?.moneda ??
          "COP") as Moneda,
      );

      /**
       * La tasa guardada es la tasa INTERNA del backend.
       * Más abajo se convierte a la convención visual
       * cuando conocemos la moneda de la cuenta.
       */
      setTasaConversion("");

      setProveedorCobra4x1000(
        salida.proveedorCobra4x1000 ??
          false,
      );

      setDescripcion(
        salida.descripcion ?? "",
      );

      setReferencia(
        salida.referencia ?? "",
      );

      setNotas(
        salida.notas ?? "",
      );

      return;
    }

    setTipo("PAGO_ACREEDOR");

    setAcreedorId(
      initialAcreedorId ?? "",
    );

    setCuentaId("");
    setMontoPago("");
    setMonedaAplicacion("COP");
    setTasaConversion("");

    setProveedorCobra4x1000(false);

    setDescripcion("");
    setReferencia("");
    setNotas("");
  }, [
    open,
    salida,
    initialAcreedorId,
  ]);

  /**
   * Al cambiar a GASTO / RETIRO:
   * no existe conversión ni deuda.
   */
  useEffect(() => {
    if (
      tipo !== "PAGO_ACREEDOR"
    ) {
      setTasaConversion("");
      setProveedorCobra4x1000(
        false,
      );
    }
  }, [tipo]);

  /**
   * Si la cuenta NO es COP, ningún 4x1000
   * debe permanecer activo.
   */
  useEffect(() => {
    if (
      selectedCuenta &&
      selectedCuenta.moneda !== "COP"
    ) {
      setProveedorCobra4x1000(
        false,
      );
    }
  }, [selectedCuenta]);

  const montoPagoNumber =
    parseFormattedNumber(montoPago) || 0;

  const tasaVisibleNumber =
    parseFormattedNumber(
      tasaConversion,
    ) || 0;

  const mismaMoneda =
    tipo !== "PAGO_ACREEDOR" ||
    monedaPago === monedaAplicacion;

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
   * ==========================================
   * TASA PARA EL BACKEND
   * ==========================================
   *
   * Backend:
   * 1 monedaAplicacion =
   * tasaConversionBackend monedaPago
   *
   * UI:
   * 1 base = tasaVisible quote
   *
   * Si pago = base y deuda = quote:
   *
   * Ej:
   * pago USD
   * deuda COP
   * UI: 1 USD = 3.200 COP
   *
   * Backend necesita:
   * 1 COP = 1/3200 USD
   *
   * Por eso enviamos 1 / tasa.
   *
   * En sentido inverso enviamos la tasa visible.
   */
  const tasaConversionBackend =
  useMemo(() => {
    if (mismaMoneda) {
      return undefined;
    }

    if (tasaVisibleNumber <= 0) {
      return undefined;
    }

    return tasaVisibleNumber;
  }, [
    mismaMoneda,
    tasaVisibleNumber,
  ]);

  /**
   * Convierte el monto BASE de la cuenta
   * a la moneda de la deuda para mostrar
   * una previsualización igual a la del backend.
   */
  const montoAplicadoCalculado =
    useMemo(() => {
      if (
        tipo !== "PAGO_ACREEDOR"
      ) {
        return montoPagoNumber;
      }

      if (mismaMoneda) {
        return montoPagoNumber;
      }

      if (tasaVisibleNumber <= 0) {
        return 0;
      }

      if (
        monedaPago ===
          parTasa.base &&
        monedaAplicacion ===
          parTasa.quote
      ) {
        return (
          montoPagoNumber *
          tasaVisibleNumber
        );
      }

      return (
        montoPagoNumber /
        tasaVisibleNumber
      );
    }, [
      tipo,
      mismaMoneda,
      montoPagoNumber,
      tasaVisibleNumber,
      monedaPago,
      monedaAplicacion,
      parTasa,
    ]);

  const puedeAplicar4x1000 =
    selectedCuenta?.moneda ===
    "COP";

  /**
   * 4x1000 del proveedor.
   *
   * Solo aplica:
   * PAGO_ACREEDOR + cuenta COP.
   */
  const impuestoProveedor4x1000 =
    useMemo(() => {
      if (
        tipo !==
          "PAGO_ACREEDOR" ||
        !puedeAplicar4x1000 ||
        !proveedorCobra4x1000
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
      puedeAplicar4x1000,
      proveedorCobra4x1000,
      montoPagoNumber,
    ]);

  /**
   * Monto enviado antes del 4x1000 propio
   * de la cuenta.
   */
  const montoEnviado =
    useMemo(
      () =>
        Math.round(
          (
            montoPagoNumber +
            impuestoProveedor4x1000 +
            Number.EPSILON
          ) *
            100,
        ) / 100,
      [
        montoPagoNumber,
        impuestoProveedor4x1000,
      ],
    );

  /**
   * 4x1000 de la cuenta.
   * El backend solo lo aplica si:
   *
   * cuenta.moneda === COP
   * &&
   * cuenta.aplica4x1000
   */
  const impuestoCuenta4x1000 =
    useMemo(() => {
      if (
        !puedeAplicar4x1000 ||
        !selectedCuenta?.aplica4x1000
      ) {
        return 0;
      }

      return (
        Math.round(
          (
            montoEnviado *
              0.004 +
            Number.EPSILON
          ) *
            100,
        ) / 100
      );
    }, [
      puedeAplicar4x1000,
      selectedCuenta,
      montoEnviado,
    ]);

  const totalDebitado =
    useMemo(
      () =>
        Math.round(
          (
            montoEnviado +
            impuestoCuenta4x1000 +
            Number.EPSILON
          ) *
            100,
        ) / 100,
      [
        montoEnviado,
        impuestoCuenta4x1000,
      ],
    );

  /**
   * Cuando editamos una salida multimoneda,
   * convertimos la tasa INTERNA almacenada
   * a la convención visual del formulario.
   */
  useEffect(() => {
    if (!open || !salida) {
      return;
    }

    const actual =
      salida as SalidaMultimoneda;

    if (
      tipo !== "PAGO_ACREEDOR" ||
      !selectedCuenta
    ) {
      return;
    }

    const monedaDeuda =
      (actual.monedaAplicacion ??
        selectedCuenta.moneda) as Moneda;

    setMonedaAplicacion(
      monedaDeuda,
    );

    if (
      selectedCuenta.moneda ===
      monedaDeuda
    ) {
      setTasaConversion("");
      return;
    }

    const tasaInterna =
      Number(
        actual.tasaConversion ??
          0,
      );

    if (
      !Number.isFinite(
        tasaInterna,
      ) ||
      tasaInterna <= 0
    ) {
      setTasaConversion("");
      return;
    }

    const par = getParTasa(
      selectedCuenta.moneda as Moneda,
      monedaDeuda,
    );

    const tasaVisual =
      selectedCuenta.moneda ===
        par.base &&
      monedaDeuda === par.quote
        ? 1 / tasaInterna
        : tasaInterna;

    setTasaConversion(
      numberToInputValue(
        tasaVisual,
      ),
    );
  }, [
    open,
    salida,
    selectedCuenta,
    tipo,
  ]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);

      if (!cuentaId) {
        alert(
          "Debes seleccionar la cuenta origen.",
        );
        return;
      }

      if (
        !montoPagoNumber ||
        montoPagoNumber <= 0
      ) {
        alert(
          "Debes indicar un monto mayor a 0.",
        );
        return;
      }

      if (
        tipo ===
          "PAGO_ACREEDOR" &&
        !acreedorId
      ) {
        alert(
          "Debes seleccionar el acreedor.",
        );
        return;
      }

      if (
        tipo ===
          "PAGO_ACREEDOR" &&
        !monedaAplicacion
      ) {
        alert(
          "Debes seleccionar la moneda de la deuda.",
        );
        return;
      }

      if (
        tipo ===
          "PAGO_ACREEDOR" &&
        !mismaMoneda &&
        (!tasaVisibleNumber ||
          tasaVisibleNumber <= 0)
      ) {
        alert(
          "Debes indicar una tasa de conversión válida.",
        );
        return;
      }

      if (
        (
          tipo === "GASTO" ||
          tipo === "RETIRO"
        ) &&
        !descripcion.trim()
      ) {
        alert(
          "Debes indicar una descripción.",
        );
        return;
      }

      const payload = {
        tipo,

        acreedorId:
          tipo ===
          "PAGO_ACREEDOR"
            ? acreedorId
            : undefined,

        cuentaId,

        /**
         * Nuevo DTO multimoneda.
         *
         * monedaPago NO se envía:
         * el backend la toma directamente
         * de la cuenta.
         */
        montoPago:
          montoPagoNumber,

        monedaAplicacion:
          tipo ===
          "PAGO_ACREEDOR"
            ? monedaAplicacion
            : undefined,

        tasaConversion:
          tipo ===
            "PAGO_ACREEDOR" &&
          !mismaMoneda
            ? tasaConversionBackend
            : undefined,

        proveedorCobra4x1000:
          tipo ===
            "PAGO_ACREEDOR" &&
          puedeAplicar4x1000
            ? proveedorCobra4x1000
            : false,

        descripcion:
          descripcion.trim() || null,

        referencia:
          referencia.trim() || null,

        notas:
          notas.trim() || null,
      };

      if (salida) {
        await api.put(
          `/salidas/${salida.id}`,
          payload,
        );
      } else {
        await api.post(
          "/salidas",
          payload,
        );
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);

      alert(
        isEditing
          ? "No fue posible editar la salida."
          : "No fue posible registrar la salida.",
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
              ? "Editar salida"
              : "Registrar salida"}
          </h2>

          <p className="text-sm text-gray-500">
            {isEditing
              ? "Modifica los datos de la salida seleccionada."
              : "Registra pagos, gastos o retiros desde cuentas COP, USD, USDT o BS."}
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

                if (
                  value !==
                  "PAGO_ACREEDOR"
                ) {
                  setAcreedorId("");
                }

                setTasaConversion("");
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
              onChange={(event) => {
                setCuentaId(
                  event.target.value,
                );

                setTasaConversion("");
                setProveedorCobra4x1000(
                  false,
                );
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
                    {cuenta.nombre} ·{" "}
                    {cuenta.moneda}
                    {cuenta.moneda ===
                      "COP" &&
                    cuenta.aplica4x1000
                      ? " · 4x1000"
                      : ""}
                  </option>
                ),
              )}
            </select>

            {selectedCuenta && (
              <p className="text-xs text-gray-500">
                El pago saldrá en{" "}
                <strong>
                  {selectedCuenta.moneda}
                </strong>
                .
              </p>
            )}
          </label>

          {/* ACREEDOR / REFERENCIA */}
          {tipo ===
          "PAGO_ACREEDOR" ? (
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

          {/* MONEDA DE DEUDA */}
          {tipo ===
            "PAGO_ACREEDOR" && (
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Reducir deuda en
              </span>

              <select
                value={
                  monedaAplicacion
                }
                onChange={(event) => {
                  setMonedaAplicacion(
                    event.target
                      .value as Moneda,
                  );

                  setTasaConversion("");
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
            </label>
          )}

          {/* MONTO */}
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              {selectedCuenta
                ? `Monto en ${selectedCuenta.moneda}`
                : "Monto"}
            </span>

            <FormattedNumberInput
              value={montoPago}
              onChange={(value) =>
                setMontoPago(value)
              }
              placeholder={
                selectedCuenta
                  ? `Monto en ${selectedCuenta.moneda}`
                  : "Monto"
              }
            />
          </label>

          {/* TASA DE CONVERSIÓN */}
          {tipo ===
            "PAGO_ACREEDOR" &&
            selectedCuenta &&
            !mismaMoneda && (
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Tasa
                </span>

                <FormattedNumberInput
                  value={
                    tasaConversion
                  }
                  onChange={(value) =>
                    setTasaConversion(
                      value,
                    )
                  }
                  placeholder={`1 ${parTasa.base} = ? ${parTasa.quote}`}
                />

                <p className="text-xs text-gray-500">
                  1 {parTasa.base} ={" "}
                  {tasaVisibleNumber >
                  0
                    ? formatAmount(
                        tasaVisibleNumber,
                      )
                    : "?"}{" "}
                  {parTasa.quote}
                </p>
              </label>
            )}

          {/* PREVISUALIZACIÓN CONVERSIÓN */}
          {tipo ===
            "PAGO_ACREEDOR" &&
            selectedCuenta &&
            !mismaMoneda &&
            tasaVisibleNumber >
              0 && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 md:col-span-2">
                <p className="text-xs font-semibold uppercase text-blue-600">
                  Aplicación a la deuda
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-900">
                  {formatCurrency(
                    montoPagoNumber,
                    monedaPago,
                  )}{" "}
                  →{" "}
                  {formatCurrency(
                    montoAplicadoCalculado,
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
                        tasaVisibleNumber,
                      )} = ${formatAmount(
                        montoAplicadoCalculado,
                      )} ${monedaAplicacion}`
                    : `${formatAmount(
                        montoPagoNumber,
                      )} ${monedaPago} ÷ ${formatAmount(
                        tasaVisibleNumber,
                      )} = ${formatAmount(
                        montoAplicadoCalculado,
                      )} ${monedaAplicacion}`}
                </p>
              </div>
            )}

          {/* 4X1000 PROVEEDOR */}
          {tipo ===
            "PAGO_ACREEDOR" &&
            puedeAplicar4x1000 && (
              <label className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={
                    proveedorCobra4x1000
                  }
                  onChange={(
                    event,
                  ) =>
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
                    Solo está
                    disponible porque la
                    cuenta origen está en
                    COP.
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
                  {formatCurrency(
                    montoPagoNumber,
                    monedaPago,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  4x1000 proveedor
                </p>

                <p className="font-bold text-orange-700">
                  {formatCurrency(
                    impuestoProveedor4x1000,
                    monedaPago,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  4x1000 cuenta
                </p>

                <p className="font-bold text-orange-700">
                  {formatCurrency(
                    impuestoCuenta4x1000,
                    monedaPago,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Total debitado
                </p>

                <p className="font-bold text-gray-900">
                  {formatCurrency(
                    totalDebitado,
                    monedaPago,
                  )}
                </p>
              </div>
            </div>

            {tipo ===
              "PAGO_ACREEDOR" && (
              <div className="mt-4 border-t border-gray-200 pt-3">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Reduce deuda
                </p>

                <p className="mt-1 font-bold text-blue-700">
                  {formatCurrency(
                    montoAplicadoCalculado,
                    monedaAplicacion,
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Los impuestos no
                  reducen la deuda. El
                  backend aplica solamente
                  el monto base convertido.
                </p>
              </div>
            )}
          </div>

          {/* REFERENCIA */}
          {tipo ===
            "PAGO_ACREEDOR" && (
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Referencia
                </span>

                <input
                  type="text"
                  value={referencia}
                  onChange={(event) =>
                    setReferencia(
                      event.target
                        .value,
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
              "space-y-1",
              tipo !==
              "PAGO_ACREEDOR"
                ? "md:col-span-2"
                : "",
            ].join(" ")}
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
            disabled={
              submitting ||
              !selectedCuenta
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? isEditing
                ? "Guardando..."
                : "Registrando..."
              : isEditing
                ? "Guardar cambios"
                : "Registrar salida"}
          </button>
        </div>
      </section>
    </div>
  );
}