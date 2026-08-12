import type {
  ClientePerfil,
  ClienteResumenItem,
} from "@/types/clientes";

import type {
  Cuenta,
  PromedioCompraCuenta,
} from "@/types/cuentas";

import type { Moneda } from "@/types/operaciones";

import { ClienteEntradaButton } from "./ClienteEntradaButton";
import { ClienteOperacionButton } from "./ClienteOperacionButton";
import { ClienteBalancesPorMoneda } from "./ClienteBalancesPorMoneda";
import { ClienteSalidaButton } from "../salidas/ClienteSalidaButton";

type BalanceGlobalMoneda = {
  moneda: Moneda;
  totalDebitos: number;
  totalCreditos: number;
  saldo: number;
  estado: string;
};

interface PerfilClienteProps {
  cliente: ClientePerfil["cliente"];

  /**
   * Se conserva porque todavía forma parte
   * de la respuesta del perfil.
   */
  balance: ClientePerfil["balance"];

  pdfUrl: string;

  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
  promedios: PromedioCompraCuenta[];

  /**
   * Estos son los balances históricos completos,
   * sin importar los filtros aplicados al ledger.
   */
  balancesGlobales: BalanceGlobalMoneda[];
}

function PerfilCliente({
  cliente,
  balance: _balance,
  pdfUrl,
  clientes,
  cuentas,
  promedios,
  balancesGlobales,
}: PerfilClienteProps) {
  /**
   * Actualmente los botones de entrada/salida
   * todavía reciben únicamente cuentas base COP.
   *
   * Cuando terminemos el frontend multimoneda
   * de abonos y pagos, esto también deberá
   * ampliarse.
   */
  const cuentasActivas = cuentas.filter(
  (cuenta) =>
    cuenta.estado === "ACTIVO",
);

  const cuentasOperativas = cuentas.filter(
    (cuenta) =>
      cuenta.estado === "ACTIVO" 
      // cuenta.categoria === "OPERATIVA",
  );

  return (
    <>
      <section className="rounded-xl bg-white p-6 shadow-md">
        <div>
          <p className="text-sm text-gray-500">
            Perfil financiero del cliente.
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {cliente.nombre}
          </h1>
        </div>

        {/**
         * IMPORTANTE:
         *
         * Estos balances NO utilizan los movimientos
         * filtrados del ledger.
         *
         * Siempre representan el estado financiero
         * total del cliente.
         */}
        <div className="mt-5">
          <ClienteBalancesPorMoneda
            clienteId={cliente.id}
            balances={balancesGlobales}
            clienteNombre={cliente.nombre}
          />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-wrap gap-2">
          <ClienteOperacionButton
            clientes={clientes}
            cuentas={cuentasOperativas}
            promedios={promedios}
          />

          <ClienteEntradaButton
            clienteId={cliente.id}
            clientes={clientes}
            cuentas={cuentasActivas}
          />

          <ClienteSalidaButton
            clienteId={cliente.id}
            clientes={clientes}
            cuentas={cuentasActivas}
          />

          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Descargar PDF
          </a>
        </div>
      </section>
    </>
  );
}

export default PerfilCliente;