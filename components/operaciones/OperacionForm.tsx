"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiUserPlus } from "react-icons/fi";

import { api } from "@/lib/api";
import { formatMoney, formatNumber } from "@/lib/formatters";
import { parseFormattedNumber } from "@/lib/number-format";

import type {
  Cliente,
  Cuenta,
  Moneda,
  OrigenOperacion,
} from "@/types/operaciones";

import type { PromedioCompraCuenta } from "@/types/cuentas";

import { FormattedNumberInput } from "../ui/FormattedNumberInput";
import PromedioCuenta from "../cuentas/PromedioCuenta";
import { ClienteFormModal } from "../clientes/ClienteFormModal";

type OperacionFormProps = {
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios: PromedioCompraCuenta[];
};

type TipoEntidadOperacion = OrigenOperacion;

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
  const [origenValue, setOrigenValue] = useState("");

  const [destinoValue, setDestinoValue] = useState("");

  const [moneda, setMoneda] = useState<Moneda>("BS");

  const [montoTransaccion, setMontoTransaccion] = useState("");

  const [tasaCompra, setTasaCompra] = useState("");

  const [tasaVenta, setTasaVenta] = useState("");

  const [nota, setNota] = useState("");

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [openClienteModal, setOpenClienteModal] = useState(false);

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

  /**
   * ==========================================
   * PREVIEW
   * ==========================================
   */

  const montoNumber = parseFormattedNumber(montoTransaccion) || 0;

  /**
   * En compra la tasa de venta no tiene
   * significado comercial.
   *
   * Como backend la exige, internamente
   * usamos la misma tasa de compra.
   */
  const tasaVentaEfectiva =
    operationMode === "COMPRA"
      ? Number(tasaCompra || 0)
      : Number(tasaVenta || 0);

  const preview = useMemo(() => {
    const monto = parseFormattedNumber(montoTransaccion) || 0;

    const tc = Number(tasaCompra || 0);

    const tv = operationMode === "COMPRA" ? tc : Number(tasaVenta || 0);

    const totalCompraCop = roundCop(monto * tc);

    const totalVentaCop = roundCop(monto * tv);

    const utilidadCop = totalVentaCop - totalCompraCop;

    return {
      totalCompraCop,
      totalVentaCop,
      utilidadCop,
    };
  }, [montoTransaccion, tasaCompra, tasaVenta, operationMode]);

  /**
   * El saldo solamente se valida cuando
   * vendemos desde una cuenta propia.
   */
  const saldoInsuficiente =
    operationMode === "VENTA" &&
    selectedOrigen?.tipo === "CUENTA" &&
    montoNumber > Number(selectedOrigen.saldo || 0);

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

    /**
     * TC siempre requerida.
     */
    if (Number(tasaCompra) <= 0) {
      setErrorMessage("Ingrese una tasa de compra válida.");

      return;
    }

    /**
     * TV solamente debe solicitarse
     * visualmente en VENTA y DIRECTA.
     *
     * COMPRA usa TC como TV interna.
     */
    if (operationMode !== "COMPRA" && Number(tasaVenta) <= 0) {
      setErrorMessage("Ingrese una tasa de venta válida.");

      return;
    }

    if (saldoInsuficiente) {
      setErrorMessage("Saldo insuficiente en la cuenta operativa.");

      return;
    }

    if (!operationMode) {
      setErrorMessage(
        "La combinación seleccionada no corresponde a una operación válida."
      );

      return;
    }

    setSaving(true);

    try {
      let payload;

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

          montoTransaccion: parseFormattedNumber(montoTransaccion),

          tasaCompra: Number(tasaCompra),

          tasaVenta: Number(tasaVenta),

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

          montoTransaccion: parseFormattedNumber(montoTransaccion),

          tasaCompra: Number(tasaCompra),

          /**
           * El backend la exige.
           *
           * Para compra no tiene significado,
           * así que usamos TC.
           */
          tasaVenta: tasaVentaEfectiva,

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

          monedaTransaccion: moneda,

          montoTransaccion: parseFormattedNumber(montoTransaccion),

          tasaCompra: Number(tasaCompra),

          tasaVenta: Number(tasaVenta),

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
      setMoneda("BS");
      setMontoTransaccion("");
      setTasaCompra("");
      setTasaVenta("");
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

        {operationMode === "VENTA" &&
          selectedOrigen?.tipo === "CUENTA" &&
          promedioCuentaSeleccionada && (
            <PromedioCuenta promedioCompra={promedioCuentaSeleccionada} />
          )}
      </div>

      {/* ERROR */}
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
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
            disabled={operationMode === "VENTA" || operationMode === "COMPRA"}
            onChange={(event) => setMoneda(event.target.value as Moneda)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="BS">BS</option>

            <option value="USD">USD</option>

            <option value="USDT">USDT</option>
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

        {/* =============================
            TASA COMPRA
        ============================== */}

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

        {/* =============================
            TOTAL COMPRA
        ============================== */}

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

        {/*
         * =================================
         * SOLO VENTA / DIRECTA
         * =================================
         *
         * En COMPRA ocultamos:
         *
         * - Tasa Venta
         * - Total Venta
         * - Utilidad
         */}
        {operationMode !== "COMPRA" && (
          <>
            {/* TASA VENTA */}
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

            {/* TOTAL VENTA */}
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

            {/* UTILIDAD */}
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

        {/* =============================
            NOTA
        ============================== */}

        <div
          className={
            operationMode === "COMPRA" ? "lg:col-span-6" : "lg:col-span-6"
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

        {/* =============================
            SUBMIT
        ============================== */}

        <div className="flex items-end lg:col-span-3">
          <button
            type="submit"
            disabled={saving}
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
