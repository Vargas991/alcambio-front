import { formatMoney } from "@/lib/formatters";
import { ClientePerfil, ClienteResumenItem } from "@/types/clientes";
import { ClienteEntradaButton } from "./ClienteEntradaButton";
import { Cuenta } from "@/types/cuentas";
import { ClienteSalidaButton } from "../salidas/ClienteSalidaButton";

interface PerfilClienteProps {
  cliente: ClientePerfil["cliente"];
  balance: ClientePerfil["balance"];
  pdfUrl: string;
  clientes: ClienteResumenItem[];
  cuentas: Cuenta[];
}

function getBalanceLabel(estado: "ME_DEBE" | "LE_DEBO" | "SALDADO") {
  const labels = {
    ME_DEBE: "Me debe",
    LE_DEBO: "Le debo",
    SALDADO: "Saldado",
  };

  return labels[estado];
}

function getBalanceClassName(estado: "ME_DEBE" | "LE_DEBO" | "SALDADO") {
  const classNames = {
    ME_DEBE: "bg-green-50 text-green-700",
    LE_DEBO: "bg-red-50 text-red-700",
    SALDADO: "bg-gray-50 text-gray-700",
  };

  return classNames[estado];
}

function PerfilCliente({
  cliente,
  balance,
  pdfUrl,
  clientes,
  cuentas,
}: PerfilClienteProps) {
  return (
    <>
      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex justify-between gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col justify-center items-start">
            <h1 className="text-3xl font-bold text-gray-900">
              {cliente.nombre}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Perfil financiero del cliente.
            </p>
          </div>

          <div className=" flex flex-col rounded-xl bg-white p-5 shadow-md">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Saldo actual
            </p>
            <p
              className={[
                "mt-2 text-3xl font-bold",
                balance.estado === "ME_DEBE"
                  ? "text-green-700"
                  : balance.estado === "LE_DEBO"
                  ? "text-red-700"
                  : "text-gray-900",
              ].join(" ")}
            >
              {formatMoney(Math.abs(balance.saldoCop))}
            </p>
            {/* <p className="mt-1 text-xs text-gray-500">
              {getBalanceLabel(balance.estado)}
            </p> */}
            <span
              className={[
                "inline-flex w-full rounded-full px-3 py-1 text-xs font-bold uppercase",
                getBalanceClassName(balance.estado),
              ].join(" ")}
            >
              {getBalanceLabel(balance.estado)}
            </span>
          </div>
        </div>
        {/* 
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">
              Documento
            </p>
            <p className="text-sm font-medium text-gray-900">
              {cliente.documento ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">
              Teléfono
            </p>
            <p className="text-sm font-medium text-gray-900">
              {cliente.telefono ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-gray-400">
              Estado
            </p>
            <p className="text-sm font-medium text-gray-900">
              {cliente.estado}
            </p>
          </div> */}
        {/* </div> */}

        {/* {cliente.notas && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase text-gray-400">
              Nota
            </p>
            <p className="mt-1 text-sm text-gray-700">{cliente.notas}</p>
          </div>
        )} */}
      </section>

      {/* <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* <div className="rounded-xl bg-white p-5 shadow-md">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Total débitos
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatMoney(balance.totalDebitosCop)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Operaciones que aumentan deuda.
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-md">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Total abonos
          </p>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatMoney(balance.totalCreditosCop)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Pagos o créditos registrados.
          </p>
        </div> */}

      {/* <div className="rounded-xl bg-white p-5 shadow-md">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Saldo actual
          </p>
          <p
            className={[
              'mt-2 text-xl font-bold',
              balance.estado === 'ME_DEBE'
                ? 'text-green-700'
                : balance.estado === 'LE_DEBO'
                  ? 'text-red-700'
                  : 'text-gray-900',
            ].join(' ')}
          >
            {formatMoney(Math.abs(balance.saldoCop))}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {getBalanceLabel(balance.estado)}
          </p>
        </div> */}

      {/* <div className="rounded-xl bg-white p-5 shadow-md">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Utilidad real
          </p>
          <p className="mt-2 text-xl font-bold text-emerald-700">
            {formatMoney(balance.totalUtilidadRealCop)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Utilidad asociada al cliente.
          </p>
        </div> */}
      {/* </section> */}

      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="flex flex-wrap gap-2">
          <ClienteEntradaButton
            clienteId={cliente.id}
            clientes={clientes}
            cuentas={cuentas}
          />
          <ClienteSalidaButton
            clienteId={cliente.id}
            clientes={clientes}
            cuentas={cuentas}
          />
          
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Descargar PDF
          </a>
        </div>
      </section>
    </>
  );
}
export default PerfilCliente;
