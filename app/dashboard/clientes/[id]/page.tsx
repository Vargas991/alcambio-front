import PerfilCliente from "@/components/clientes/PerfilCliente";
import { ClientePerfilTabs } from "@/components/clientes/ClientePerfilTabs";

import {
  getClienteLedgerServer,
  getClientePerfilServer,
  getClientesServer,
} from "@/services/clientes.server";

import {
  getCuentasServer,
  getOperacionesServer,
} from "@/services/operaciones.server";

import { getPromedioCompraCuentasServer } from "@/services/cuentas.server";

import type {
  EstadoOperacion,
  Moneda,
  TipoOperacion,
} from "@/types/operaciones";

type ClienteDetallePageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    tipo?: TipoOperacion;
    estado?: EstadoOperacion;
    moneda?: Moneda;
    tipoMov?: string;
    desde?: string;
    hasta?: string;
    buscar?: string;
    metodoCalculo?: string;
  }>;
};

export default async function ClienteDetallePage({
  params,
  searchParams,
}: ClienteDetallePageProps) {
  const { id } = await params;
  const filters = await searchParams;

  /**
   * =========================================
   * URL DEL PDF
   * =========================================
   *
   * El PDF conserva exactamente los filtros
   * utilizados actualmente en el ledger.
   */
  const pdfSearchParams = new URLSearchParams();

  if (filters.desde) {
    pdfSearchParams.set(
      "desde",
      filters.desde,
    );
  }

  if (filters.hasta) {
    pdfSearchParams.set(
      "hasta",
      filters.hasta,
    );
  }

  if (filters.tipo) {
    pdfSearchParams.set(
      "tipo",
      filters.tipo,
    );
  }

  if (filters.estado) {
    pdfSearchParams.set(
      "estado",
      filters.estado,
    );
  }

  if (filters.tipoMov) {
    pdfSearchParams.set(
      "tipoMov",
      filters.tipoMov,
    );
  }

  if (filters.metodoCalculo) {
    pdfSearchParams.set(
      "metodoCalculo",
      filters.metodoCalculo,
    );
  }

  if (filters.moneda) {
    pdfSearchParams.set(
      "moneda",
      filters.moneda,
    );
  }

  const pdfQuery =
    pdfSearchParams.toString();

  const pdfUrl =
    `/api/clientes/${id}/ledger/pdf` +
    (pdfQuery ? `?${pdfQuery}` : "");

  /**
   * =========================================
   * DATOS
   * =========================================
   */
  const [
    perfil,
    operaciones,
    ledger,
    clientes,
    cuentas,
    promedios,
  ] = await Promise.all([
    /**
     * Perfil general.
     */
    getClientePerfilServer(id),

    /**
     * Operaciones.
     *
     * Esto se mantiene porque todavía
     * ClientePerfilTabs recibe operaciones.
     */
    getOperacionesServer({
      clienteId: id,
      tipo: filters.tipo,
      estado: filters.estado,
      moneda: filters.moneda,
      desde: filters.desde,
      hasta: filters.hasta,
      buscar: filters.buscar,
    }),

    /**
     * Ledger.
     *
     * Este sí recibe todos los filtros,
     * incluyendo metodoCalculo.
     *
     * Su respuesta contiene:
     *
     * ledger.movimientos
     * -> movimientos FILTRADOS
     *
     * ledger.resumen.balancesFiltrados
     * -> balances según filtros
     *
     * ledger.resumen.balancesGlobales
     * -> balance TOTAL del cliente
     */
    getClienteLedgerServer(id, {
      tipo: filters.tipo,
      estado: filters.estado,
      moneda: filters.moneda,
      tipoMov: filters.tipoMov,
      desde: filters.desde,
      hasta: filters.hasta,
      buscar: filters.buscar,
      metodoCalculo:
        filters.metodoCalculo,
    }),

    getClientesServer(),
    getCuentasServer(),
    getPromedioCompraCuentasServer(),
  ]);

  const { cliente, balance } = perfil;

  return (
    <div className="space-y-6">
      {/**
       * =======================================
       * CABECERA / BALANCE GLOBAL
       * =======================================
       *
       * IMPORTANTE:
       *
       * balancesGlobales NO depende de:
       * - fecha
       * - método
       * - moneda
       * - tipo de operación
       *
       * Siempre muestra la deuda total real.
       */}
      <PerfilCliente
        cliente={cliente}
        balance={balance}
        pdfUrl={pdfUrl}
        clientes={clientes}
        cuentas={cuentas}
        promedios={promedios}
        balancesGlobales={
          ledger.resumen.balancesGlobales
        }
      />

      {/**
       * =======================================
       * MOVIMIENTOS
       * =======================================
       *
       * Aquí sí utilizamos ledger.movimientos,
       * porque estos respetan los filtros
       * seleccionados.
       */}
      <ClientePerfilTabs
        operaciones={operaciones}
        movimientos={ledger.movimientos}
        promedios={promedios}
        cuentas={cuentas}
        clientes={clientes}
        clienteId={id}
      />
    </div>
  );
}