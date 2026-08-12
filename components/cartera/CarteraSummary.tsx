'use client';

import type {
  CarteraResponse,
  Moneda,
} from '@/types/clientes';

type CarteraSummaryProps = {
  cartera: CarteraResponse;
  moneda: Moneda;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CarteraSummary({
  cartera,
  moneda,
}: CarteraSummaryProps) {
  const resumen =
    cartera.resumenPorMoneda.find(
      (item) => item.moneda === moneda,
    );

  if (!resumen) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-sm text-gray-500">
          No hay información de cartera para {moneda}.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-md">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Por cobrar
          </p>

          <p className="mt-2 text-xl font-bold text-green-700">
            {formatAmount(
              Number(
                resumen.totalPorCobrar ?? 0,
              ),
            )}{' '}
            {resumen.moneda}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {cartera.cantidadMeDeben} clientes me deben
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-md">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Por pagar
          </p>

          <p className="mt-2 text-xl font-bold text-red-700">
            {formatAmount(
              Number(
                resumen.totalPorPagar ?? 0,
              ),
            )}{' '}
            {resumen.moneda}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {cartera.cantidadLesDebo}{' '}
            clientes/proveedores
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-md">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Balance neto
          </p>

          <p
            className={[
              'mt-2 text-xl font-bold',
              Number(
                resumen.balanceNeto,
              ) >= 0
                ? 'text-green-700'
                : 'text-red-700',
            ].join(' ')}
          >
            {formatAmount(
              Math.abs(
                Number(
                  resumen.balanceNeto ?? 0,
                ),
              ),
            )}{' '}
            {resumen.moneda}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {Number(
              resumen.balanceNeto,
            ) >= 0
              ? 'Neto por cobrar'
              : 'Neto por pagar'}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-md">
          <p className="text-xs font-semibold uppercase text-gray-400">
            Clientes con saldo
          </p>

          <p className="mt-2 text-xl font-bold text-gray-900">
            {Number(
              cartera.cantidadMeDeben ?? 0,
            ) +
              Number(
                cartera.cantidadLesDebo ?? 0,
              )}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Pendientes en cartera
          </p>
        </div>
      </div>
    </section>
  );
}