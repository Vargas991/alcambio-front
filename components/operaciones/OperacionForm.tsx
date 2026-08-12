"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiUserPlus } from "react-icons/fi";

import { api } from "@/lib/api";
import { formatNumber } from "@/lib/formatters";
import { parseFormattedNumber } from "@/lib/number-format";

import type {
  Cliente,
  Cuenta,
  Moneda,
  OrigenOperacion,
} from "@/types/operaciones";

import type { PromedioCompraCuenta } from "@/types/cuentas";

import { FormattedNumberInput } from "../ui/FormattedNumberInput";
import { ClienteFormModal } from "../clientes/ClienteFormModal";

type OperacionFormProps = {
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios: PromedioCompraCuenta[];
};

type TipoEntidadOperacion = OrigenOperacion;

type MetodoCalculoOperacion = "TASA" | "PORCENTAJE";
type AplicacionPorcentaje = "SUMAR" | "DESCONTAR";

type OperacionPayload = {
  tipo: "VENTA" | "COMPRA" | "OPERACION_DIRECTA";
  nombre: string;
  deudorId?: string;
  acreedorId?: string;
  cuentaOperativaId?: string;
  monedaTransaccion: Moneda;
  montoTransaccion: number;
  metodoCalculo: MetodoCalculoOperacion;
  tasaCompra?: number;
  tasaVenta?: number;
  porcentaje?: number;
  aplicacionPorcentaje?: AplicacionPorcentaje;
  monedaDeuda: Moneda;
  destinatario?: string;
  notas?: string;
};

function roundCop(value: number) {
  return Math.round(value);
}

export function OperacionForm({
  clientes,
  cuentas,
  promedios,
}: OperacionFormProps) {
  const router = useRouter();

  /**
   * Ahora tenemos:
   *
   * ORIGEN
   * - cuenta
   * - cliente/proveedor
   *
   * DESTINO
   * - cliente
   * - cuenta operativa
   */
  /**
   * ==========================================
   * MONEDAS DISPONIBLES
   * ==========================================
   *
   * Solo se permiten monedas que tengan al menos
   * una cuenta ACTIVA creada en el sistema.
   */
  
  const [origenValue, setOrigenValue] = useState("");
  
  const [destinoValue, setDestinoValue] = useState("");

  
  const [metodoCalculo, setMetodoCalculo] =
  useState<MetodoCalculoOperacion>("TASA");
  const [porcentaje, setPorcentaje] = useState("");
  const [aplicacionPorcentaje, setAplicacionPorcentaje] =
  useState<AplicacionPorcentaje>("SUMAR");
  
  const [montoTransaccion, setMontoTransaccion] = useState("");
  
  const [tasaCompra, setTasaCompra] = useState("");
  
  const [tasaVenta, setTasaVenta] = useState("");
  
  const [nota, setNota] = useState("");

  const [saving, setSaving] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState("");
  
  const [openClienteModal, setOpenClienteModal] = useState(false);
  
  
  const monedasDisponibles = useMemo<Moneda[]>(() => {
    return Array.from(
      new Set(
        cuentas
        .filter(
          (cuenta) =>
            cuenta.estado === 'ACTIVO',
        )
        .map(
          (cuenta) =>
            cuenta.moneda,
        ),
      ),
    );
  }, [cuentas]);
  const monedaInicial = monedasDisponibles[0] ?? "COP";
  const [moneda, setMoneda] = useState<Moneda>(monedaInicial);
  const [monedaDeuda, setMonedaDeuda] = useState<Moneda>(monedaInicial);
  /**
   * ==========================================
   * ENTIDADES DISPONIBLES
   * ==========================================
   */

  const entidades = useMemo<TipoEntidadOperacion[]>(() => {
    const cuentasOperativas = cuentas
      .filter((cuenta) => cuenta.estado === "ACTIVO")
      .filter((cuenta) => cuenta.categoria === "OPERATIVA")
      .map((cuenta) => ({
        tipo: "CUENTA" as const,
        id: cuenta.id,
        nombre: cuenta.nombre,
        moneda: cuenta.moneda,
        saldo: cuenta.saldo,
      }));

    const clientesActivos = clientes
      .filter((cliente) => cliente.estado === "ACTIVO")
      .map((cliente) => ({
        tipo: "CLIENTE" as const,
        id: cliente.id,
        nombre: cliente.nombre,
      }));

    return [...cuentasOperativas, ...clientesActivos];
  }, [clientes, cuentas]);

  /**
   * ==========================================
   * ORIGEN SELECCIONADO
   * ==========================================
   */

  const selectedOrigen = useMemo(
    () => entidades.find((item) => `${item.tipo}:${item.id}` === origenValue),
    [entidades, origenValue]
  );

  /**
   * ==========================================
   * DESTINO SELECCIONADO
   * ==========================================
   */

  const selectedDestino = useMemo(
    () => entidades.find((item) => `${item.tipo}:${item.id}` === destinoValue),
    [entidades, destinoValue]
  );

  /**
   * ==========================================
   * PROMEDIOS POR CUENTA
   * ==========================================
   */

  const promediosPorCuenta = useMemo(() => {
    return Object.fromEntries(
      promedios.map((promedio) => [promedio.cuentaId, promedio])
    );
  }, [promedios]);

  /**
   * Para venta interesa el promedio
   * de la cuenta ORIGEN.
   */
  const promedioCuentaSeleccionada = useMemo(() => {
    if (selectedOrigen?.tipo !== "CUENTA") {
      return undefined;
    }

    return promediosPorCuenta[selectedOrigen.id];
  }, [selectedOrigen, promediosPorCuenta]);

  /**
   * ==========================================
   * TIPO DE OPERACIÓN
   * ==========================================
   *
   * CUENTA  -> CLIENTE = VENTA
   * CLIENTE -> CUENTA  = COMPRA
   * CLIENTE -> CLIENTE = DIRECTA
   */

  const operationMode = useMemo(() => {
    if (
      selectedOrigen?.tipo === "CUENTA" &&
      selectedDestino?.tipo === "CLIENTE"
    ) {
      return "VENTA" as const;
    }

    if (
      selectedOrigen?.tipo === "CLIENTE" &&
      selectedDestino?.tipo === "CUENTA"
    ) {
      return "COMPRA" as const;
    }

    if (
      selectedOrigen?.tipo === "CLIENTE" &&
      selectedDestino?.tipo === "CLIENTE"
    ) {
      return "DIRECTA" as const;
    }

    return null;
  }, [selectedOrigen, selectedDestino]);

  const monedaTransaccion = useMemo<Moneda>(() => {
    if (operationMode === "VENTA" && selectedOrigen?.tipo === "CUENTA") {
      return selectedOrigen.moneda;
    }

    if (operationMode === "COMPRA" && selectedDestino?.tipo === "CUENTA") {
      return selectedDestino.moneda;
    }

    return moneda;
  }, [operationMode, selectedOrigen, selectedDestino, moneda]);

  useEffect(() => {
    if (operationMode !== "VENTA" && metodoCalculo === "PORCENTAJE") {
      setMetodoCalculo("TASA");
      setPorcentaje("");
      setAplicacionPorcentaje("SUMAR");
    }
  }, [operationMode, metodoCalculo]);

  useEffect(() => {
    if (metodoCalculo === "PORCENTAJE") {
      setMonedaDeuda(monedaTransaccion);
    }
  }, [metodoCalculo, monedaTransaccion]);

  /**
   * Si cambia la lista de cuentas activas y una
   * moneda deja de estar disponible, movemos el
   * formulario automáticamente a una moneda válida.
   */
  useEffect(() => {
    if (monedasDisponibles.length === 0) {
      return;
    }

    if (!monedasDisponibles.includes(moneda)) {
      setMoneda(monedasDisponibles[0]);
    }

    if (!monedasDisponibles.includes(monedaDeuda)) {
      setMonedaDeuda(monedasDisponibles[0]);
    }
  }, [monedasDisponibles, moneda, monedaDeuda]);

  /**
   * ==========================================
   * PREVIEW
   * ==========================================
   */

  const montoNumber = parseFormattedNumber(montoTransaccion) || 0;
  const tasaCompraNumber = Number(tasaCompra || 0);
  const tasaVentaNumber = Number(tasaVenta || 0);
  const porcentajeNumber = Number(porcentaje || 0);

  const tasaVentaEfectiva =
    operationMode === "COMPRA" ? tasaCompraNumber : tasaVentaNumber;

  const previewTasa = useMemo(() => {
    const totalCompra = roundCop(montoNumber * tasaCompraNumber);
    const totalVenta = roundCop(montoNumber * tasaVentaEfectiva);
    const utilidad = totalVenta - totalCompra;

    return {
      totalCompra,
      totalVenta,
      utilidad,
    };
  }, [montoNumber, tasaCompraNumber, tasaVentaEfectiva]);

  const previewPorcentaje = useMemo(() => {
    const montoComision = Number(
      ((montoNumber * porcentajeNumber) / 100).toFixed(6)
    );

    const montoEntregado =
      aplicacionPorcentaje === "DESCONTAR"
        ? Number((montoNumber - montoComision).toFixed(6))
        : montoNumber;

    const montoDeuda =
      aplicacionPorcentaje === "SUMAR"
        ? Number((montoNumber + montoComision).toFixed(6))
        : montoNumber;

    return {
      montoComision,
      montoEntregado,
      montoDeuda,
    };
  }, [montoNumber, porcentajeNumber, aplicacionPorcentaje]);

  /**
   * El saldo solamente se valida cuando
   * vendemos desde una cuenta propia.
   */
  const montoSalidaCuenta =
    metodoCalculo === "PORCENTAJE"
      ? previewPorcentaje.montoEntregado
      : montoNumber;

  const saldoInsuficiente =
    operationMode === "VENTA" &&
    selectedOrigen?.tipo === "CUENTA" &&
    montoSalidaCuenta > Number(selectedOrigen.saldo || 0);

  /**
   * ==========================================
   * CAMBIO DE ORIGEN
   * ==========================================
   */

  function handleOrigenChange(value: string) {
    setOrigenValue(value);
    setDestinoValue("");
    setErrorMessage("");

    const origen = entidades.find(
      (item) => `${item.tipo}:${item.id}` === value
    );

    if (!origen) {
      setTasaCompra("");
      setTasaVenta("");
      return;
    }

    /**
     * CUENTA COMO ORIGEN
     *
     * Será una venta.
     */
    if (origen.tipo === "CUENTA") {
      setMoneda(origen.moneda);

      const promedio = promediosPorCuenta[origen.id];

      if (promedio && promedio.promedioCompra > 0) {
        setTasaCompra(String(promedio.promedioCompra));
      } else {
        setTasaCompra("");
      }

      setTasaVenta("");

      return;
    }

    /**
     * CLIENTE COMO ORIGEN
     *
     * Puede terminar siendo:
     *
     * CLIENTE -> CUENTA  = COMPRA
     * CLIENTE -> CLIENTE = DIRECTA
     */
    setTasaCompra("");
    setTasaVenta("");
  }

  /**
   * ==========================================
   * CAMBIO DE DESTINO
   * ==========================================
   */

  function handleDestinoChange(value: string) {
    setDestinoValue(value);
    setErrorMessage("");

    const destino = entidades.find(
      (item) => `${item.tipo}:${item.id}` === value
    );

    if (!destino) {
      return;
    }

    /**
     * Cuando el destino es una cuenta,
     * estamos haciendo una COMPRA.
     *
     * La moneda queda determinada por
     * la cuenta operativa que recibe.
     */
    if (destino.tipo === "CUENTA") {
      setMoneda(destino.moneda);
    }
  }

  /**
   * ==========================================
   * SUBMIT
   * ==========================================
   */

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!selectedOrigen) {
      setErrorMessage("Seleccione un origen/proveedor.");

      return;
    }

    if (!selectedDestino) {
      setErrorMessage("Seleccione un destino.");

      return;
    }

    /**
     * CUENTA -> CUENTA no corresponde
     * al módulo operaciones.
     */
    if (selectedOrigen.tipo === "CUENTA" && selectedDestino.tipo === "CUENTA") {
      setErrorMessage(
        "Para movimientos entre cuentas propias utiliza el módulo de traslados."
      );

      return;
    }

    /**
     * No tiene sentido cliente -> mismo cliente.
     */
    if (
      selectedOrigen.tipo === "CLIENTE" &&
      selectedDestino.tipo === "CLIENTE" &&
      selectedOrigen.id === selectedDestino.id
    ) {
      setErrorMessage("El origen y el cliente destino no pueden ser el mismo.");

      return;
    }

    if (parseFormattedNumber(montoTransaccion) <= 0) {
      setErrorMessage("Ingrese un monto válido.");

      return;
    }

    if (!operationMode) {
      setErrorMessage(
        "La combinación seleccionada no corresponde a una operación válida."
      );
      return;
    }

    if (metodoCalculo === "TASA") {
      if (tasaCompraNumber <= 0) {
        setErrorMessage("Ingrese una tasa de compra válida.");
        return;
      }

      if (operationMode !== "COMPRA" && tasaVentaNumber <= 0) {
        setErrorMessage("Ingrese una tasa de venta válida.");
        return;
      }

      if (!monedaDeuda) {
        setErrorMessage("Seleccione la moneda de la deuda.");
        return;
      }

      if (!monedasDisponibles.includes(monedaDeuda)) {
        setErrorMessage(
          "La moneda de la deuda debe corresponder a una cuenta activa.",
        );
        return;
      }
    }

    if (metodoCalculo === "PORCENTAJE") {
      if (operationMode !== "VENTA") {
        setErrorMessage(
          "El cálculo por porcentaje solo está disponible para ventas."
        );
        return;
      }

      if (porcentajeNumber <= 0) {
        setErrorMessage("Ingrese un porcentaje válido.");
        return;
      }

      if (
        aplicacionPorcentaje === "DESCONTAR" &&
        previewPorcentaje.montoEntregado <= 0
      ) {
        setErrorMessage(
          "El porcentaje descontado no puede dejar el resultado en cero o negativo."
        );
        return;
      }
    }

    if (saldoInsuficiente) {
      setErrorMessage("Saldo insuficiente en la cuenta operativa.");

      return;
    }

    setSaving(true);

    try {
      let payload: OperacionPayload | null = null;

      const datosCalculo =
        metodoCalculo === "TASA"
          ? {
              metodoCalculo: "TASA" as const,
              tasaCompra: tasaCompraNumber,
              tasaVenta: tasaVentaEfectiva,
              monedaDeuda,
            }
          : {
              metodoCalculo: "PORCENTAJE" as const,
              porcentaje: porcentajeNumber,
              aplicacionPorcentaje,
              monedaDeuda: monedaTransaccion,
            };

      /**
       * =====================================
       * VENTA
       *
       * CUENTA -> CLIENTE
       * =====================================
       */
      if (
        operationMode === "VENTA" &&
        selectedOrigen.tipo === "CUENTA" &&
        selectedDestino.tipo === "CLIENTE"
      ) {
        payload = {
          tipo: "VENTA",

          nombre: `Venta a ${selectedDestino.nombre}`,

          deudorId: selectedDestino.id,

          cuentaOperativaId: selectedOrigen.id,

          monedaTransaccion: selectedOrigen.moneda,

          montoTransaccion: montoNumber,

          ...datosCalculo,

          destinatario: selectedDestino.nombre,

          notas: nota || undefined,
        };
      }

      /**
       * =====================================
       * COMPRA
       *
       * CLIENTE/PROVEEDOR -> CUENTA
       * =====================================
       */
      if (
        operationMode === "COMPRA" &&
        selectedOrigen.tipo === "CLIENTE" &&
        selectedDestino.tipo === "CUENTA"
      ) {
        payload = {
          tipo: "COMPRA",

          nombre: `Compra a ${selectedOrigen.nombre}`,

          /**
           * El proveedor/origen es
           * quien nosotros quedamos debiendo.
           */
          acreedorId: selectedOrigen.id,

          cuentaOperativaId: selectedDestino.id,

          monedaTransaccion: selectedDestino.moneda,

          montoTransaccion: montoNumber,

          ...datosCalculo,

          destinatario: selectedDestino.nombre,

          notas: nota || undefined,
        };
      }

      /**
       * =====================================
       * OPERACIÓN DIRECTA
       *
       * CLIENTE -> CLIENTE
       * =====================================
       */
      if (
        operationMode === "DIRECTA" &&
        selectedOrigen.tipo === "CLIENTE" &&
        selectedDestino.tipo === "CLIENTE"
      ) {
        payload = {
          tipo: "OPERACION_DIRECTA",

          nombre: `Operación directa ${selectedOrigen.nombre} a ${selectedDestino.nombre}`,

          acreedorId: selectedOrigen.id,

          deudorId: selectedDestino.id,

          monedaTransaccion,

          montoTransaccion: montoNumber,

          ...datosCalculo,

          destinatario: selectedDestino.nombre,

          notas: nota || undefined,
        };
      }

      if (!payload) {
        throw new Error("No fue posible determinar la operación.");
      }

      await api.post("/operaciones", payload);

      /**
       * LIMPIAR
       */
      setOrigenValue("");
      setDestinoValue("");

      const monedaDefault = monedasDisponibles[0] ?? "COP";

      setMoneda(monedaDefault);
      setMonedaDeuda(monedaDefault);
      setMontoTransaccion("");
      setMetodoCalculo("TASA");
      setTasaCompra("");
      setTasaVenta("");
      setPorcentaje("");
      setAplicacionPorcentaje("SUMAR");
      setNota("");

      router.refresh();
    } catch (error) {
      console.error(error);

      setErrorMessage("No fue posible registrar la operación.");
    } finally {
      setSaving(false);
    }
  }

  /**
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <section className="rounded-xl bg-white p-6 shadow-md">
      {/* HEADER */}
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Operaciones</h1>

          <p className="text-sm text-gray-500">
            Registra compras, ventas y operaciones directas.
          </p>
        </div>

        {selectedOrigen?.tipo === "CUENTA" && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Promedio de compra
            </p>

            {promedioCuentaSeleccionada &&
            Number(promedioCuentaSeleccionada.promedioCompra) > 0 ? (
              <p className="text-lg font-bold text-blue-800">
                {formatNumber(
                  Number(promedioCuentaSeleccionada.promedioCompra)
                )}{" "}
                COP
              </p>
            ) : (
              <p className="text-sm font-semibold text-amber-700">
                Sin promedio registrado
              </p>
            )}
          </div>
        )}
      </div>

      {/* ERROR */}
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {monedasDisponibles.length === 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Debes crear o activar al menos una cuenta para registrar operaciones.
        </div>
      )}

      {/* TIPO DETECTADO */}
      {operationMode && (
        <div className="mb-4 flex">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold",
              operationMode === "COMPRA"
                ? "bg-green-50 text-green-700"
                : operationMode === "VENTA"
                ? "bg-blue-50 text-blue-700"
                : "bg-purple-50 text-purple-700",
            ].join(" ")}
          >
            {operationMode === "COMPRA"
              ? "COMPRA"
              : operationMode === "VENTA"
              ? "VENTA"
              : "OPERACIÓN DIRECTA"}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-12">
        {/* =============================
            ORIGEN
        ============================== */}

        <div className="lg:col-span-3">
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
              {entidades
                .filter((item) => item.tipo === "CUENTA")
                .map((item) => (
                  <option key={`CUENTA:${item.id}`} value={`CUENTA:${item.id}`}>
                    {item.nombre} - {formatNumber(item.saldo)} {item.moneda}
                  </option>
                ))}
            </optgroup>

            <optgroup label="Clientes / proveedores">
              {entidades
                .filter((item) => item.tipo === "CLIENTE")
                .map((item) => (
                  <option
                    key={`CLIENTE:${item.id}`}
                    value={`CLIENTE:${item.id}`}
                  >
                    {item.nombre}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* =============================
            DESTINO
        ============================== */}

        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            {selectedOrigen?.tipo === "CLIENTE"
              ? "Cliente / cuenta destino"
              : "Cliente"}
          </label>

          <select
            value={destinoValue}
            onChange={(event) => handleDestinoChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Seleccione destino</option>

            {/* CLIENTES */}
            <optgroup label="Clientes">
              {clientes
                .filter((cliente) => cliente.estado === "ACTIVO")
                .filter(
                  (cliente) =>
                    !(
                      selectedOrigen?.tipo === "CLIENTE" &&
                      selectedOrigen.id === cliente.id
                    )
                )
                .map((cliente) => (
                  <option
                    key={`CLIENTE:${cliente.id}`}
                    value={`CLIENTE:${cliente.id}`}
                  >
                    {cliente.nombre}
                  </option>
                ))}
            </optgroup>

            {/*
             * Las cuentas solamente aparecen
             * cuando el origen es CLIENTE.
             *
             * Esto habilita:
             *
             * CLIENTE -> CUENTA = COMPRA
             */}
            {selectedOrigen?.tipo === "CLIENTE" && (
              <optgroup label="Mis cuentas operativas">
                {cuentas
                  .filter(
                    (cuenta) =>
                      cuenta.estado === "ACTIVO" &&
                      cuenta.categoria === "OPERATIVA"
                  )
                  .map((cuenta) => (
                    <option
                      key={`CUENTA:${cuenta.id}`}
                      value={`CUENTA:${cuenta.id}`}
                    >
                      {cuenta.nombre} · {cuenta.moneda}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* NUEVO CLIENTE */}
        <div className="flex items-end lg:col-span-1">
          <button
            type="button"
            onClick={() => setOpenClienteModal(true)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-tr from-green-600 to-blue-400 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:cursor-pointer hover:shadow-lg hover:shadow-blue-500/40"
          >
            <FiUserPlus className="h-4 w-4" />
          </button>
        </div>

        {/* =============================
            MONEDA
        ============================== */}

        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Moneda
          </label>

          <select
            value={
              operationMode === "VENTA" && selectedOrigen?.tipo === "CUENTA"
                ? selectedOrigen.moneda
                : operationMode === "COMPRA" &&
                  selectedDestino?.tipo === "CUENTA"
                ? selectedDestino.moneda
                : moneda
            }
            disabled={
              monedasDisponibles.length === 0 ||
              operationMode === "VENTA" ||
              operationMode === "COMPRA"
            }
            onChange={(event) => setMoneda(event.target.value as Moneda)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {monedasDisponibles.length === 0 ? (
              <option value="">
                No hay monedas disponibles
              </option>
            ) : (
              monedasDisponibles.map((monedaItem) => (
                <option key={monedaItem} value={monedaItem}>
                  {monedaItem}
                </option>
              ))
            )}
          </select>
        </div>

        {/* =============================
            MONTO
        ============================== */}

        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Monto
          </label>

          <FormattedNumberInput
            value={montoTransaccion}
            onChange={(value) => setMontoTransaccion(value)}
            placeholder="0"
          />
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Método de cálculo
          </label>

          <select
            value={metodoCalculo}
            onChange={(event) =>
              setMetodoCalculo(event.target.value as MetodoCalculoOperacion)
            }
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="TASA">Por tasa</option>

            {operationMode === "VENTA" && (
              <option value="PORCENTAJE">Por porcentaje</option>
            )}
          </select>
        </div>

        {metodoCalculo === "TASA" ? (
          <>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Tasa compra
              </label>

              <input
                type="number"
                min="0"
                step="0.0001"
                value={tasaCompra}
                onChange={(event) => setTasaCompra(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="0"
              />
            </div>

            {operationMode !== "COMPRA" && (
              <div className="lg:col-span-3">
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Tasa venta
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={tasaVenta}
                  onChange={(event) => setTasaVenta(event.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="0"
                />
              </div>
            )}

            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Moneda de la deuda
              </label>

              <select
                value={monedaDeuda}
                onChange={(event) =>
                  setMonedaDeuda(event.target.value as Moneda)
                }
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {monedasDisponibles.length === 0 ? (
                  <option value="">
                    No hay monedas disponibles
                  </option>
                ) : (
                  monedasDisponibles.map((monedaItem) => (
                    <option key={monedaItem} value={monedaItem}>
                      {monedaItem}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div
              className={
                operationMode === "COMPRA" ? "lg:col-span-6" : "lg:col-span-3"
              }
            >
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

            

            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Total compra ({monedaDeuda})
              </label>

              <input
                readOnly
                value={`${formatNumber(previewTasa.totalCompra)} ${monedaDeuda}`}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none"
              />
            </div>

            {operationMode !== "COMPRA" && (
              <>
                <div className="lg:col-span-3">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Total venta ({monedaDeuda})
                  </label>

                  <input
                    readOnly
                    value={`${formatNumber(previewTasa.totalVenta)} ${monedaDeuda}`}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="mb-1 block text-sm font-semibold text-gray-700">
                    Utilidad estimada ({monedaDeuda})
                  </label>

                  <input
                    readOnly
                    value={`${formatNumber(previewTasa.utilidad)} ${monedaDeuda}`}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-green-50 px-3 text-sm font-semibold text-green-700 outline-none"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Porcentaje
              </label>

              <input
                type="number"
                min="0.0001"
                max="100"
                step="0.0001"
                value={porcentaje}
                onChange={(event) => setPorcentaje(event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="1.5"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Aplicación
              </label>

              <select
                value={aplicacionPorcentaje}
                onChange={(event) =>
                  setAplicacionPorcentaje(
                    event.target.value as AplicacionPorcentaje
                  )
                }
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="SUMAR">Sumar al monto</option>
                <option value="DESCONTAR">Descontar del monto</option>
              </select>
            </div>

            <div
              className={
                operationMode === "COMPRA" ? "lg:col-span-6" : "lg:col-span-3"
              }
            >
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
            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Moneda de la deuda
              </label>

              <input
                readOnly
                value={monedaTransaccion}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Comisión
              </label>

              <input
                readOnly
                value={`${formatNumber(
                  previewPorcentaje.montoComision
                )} ${monedaTransaccion}`}
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Monto entregado
              </label>

              <input
                readOnly
                value={`${formatNumber(
                  previewPorcentaje.montoEntregado
                )} ${monedaTransaccion}`}
                className={[
                  "h-11 w-full rounded-lg border px-3 text-sm font-semibold outline-none",
                  previewPorcentaje.montoEntregado > 0
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-red-200 bg-red-50 text-red-700",
                ].join(" ")}
              />
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Deuda generada
              </label>

              <input
                readOnly
                value={`${formatNumber(
                  previewPorcentaje.montoDeuda
                )} ${monedaTransaccion}`}
                className="h-11 w-full rounded-lg border border-green-200 bg-green-50 px-3 text-sm font-semibold text-green-700 outline-none"
              />
            </div>
          </>
        )}

        {/* =============================
            NOTA
        ============================== */}

        {/* =============================
            SUBMIT
        ============================== */}

        <div className="flex items-end lg:col-span-12">
          <button
            type="submit"
            disabled={saving || monedasDisponibles.length === 0}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-tr from-green-600 to-blue-400 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:cursor-pointer hover:shadow-lg hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiPlus className="h-4 w-4" />

            {saving
              ? "Guardando..."
              : operationMode === "COMPRA"
              ? "Registrar compra"
              : operationMode === "VENTA"
              ? "Registrar venta"
              : operationMode === "DIRECTA"
              ? "Registrar directa"
              : "Registrar"}
          </button>
        </div>
      </form>

      <ClienteFormModal
        cliente={null}
        open={openClienteModal}
        onClose={() => setOpenClienteModal(false)}
      />
    </section>
  );
}