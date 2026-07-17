import { formatMoney } from '@/lib/formatters';
import type { CarteraResponse } from '@/types/clientes';

type CarteraSummaryProps = {
  cartera: CarteraResponse;
};

export function CarteraSummary({ cartera }: CarteraSummaryProps) {
  const { resumen } = cartera;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-xs font-semibold uppercase text-gray-400">
          Por cobrar
        </p>
        <p className="mt-2 text-xl font-bold text-green-700">
          {formatMoney(resumen.totalPorCobrarCop)}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {resumen.cantidadMeDeben} clientes me deben
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-xs font-semibold uppercase text-gray-400">
          Por pagar
        </p>
        <p className="mt-2 text-xl font-bold text-red-700">
          {formatMoney(resumen.totalPorPagarCop)}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {resumen.cantidadLesDebo} clientes/proveedores
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-xs font-semibold uppercase text-gray-400">
          Balance neto
        </p>
        <p
          className={[
            'mt-2 text-xl font-bold',
            resumen.balanceNetoCop >= 0 ? 'text-green-700' : 'text-red-700',
          ].join(' ')}
        >
          {formatMoney(Math.abs(resumen.balanceNetoCop))}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {resumen.balanceNetoCop >= 0 ? 'Neto a favor' : 'Neto por pagar'}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-xs font-semibold uppercase text-gray-400">
          Clientes con saldo
        </p>
        <p className="mt-2 text-xl font-bold text-gray-900">
          {resumen.cantidadMeDeben + resumen.cantidadLesDebo}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Pendientes en cartera
        </p>
      </div>
    </section>
  );
}