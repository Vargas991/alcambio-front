'use client';

import { useState } from 'react';

import { CarteraSummary } from '@/components/cartera/CarteraSummary';
import { CarteraTable } from '@/components/cartera/CarteraTable';

import type {
  CarteraResponse,
  Moneda,
} from '@/types/clientes';

type CarteraContentProps = {
  cartera: CarteraResponse;
};

export function CarteraContent({
  cartera,
}: CarteraContentProps) {
  const monedas =
    cartera.resumenPorMoneda.map(
      (item) => item.moneda,
    );

  const [monedaFiltro, setMonedaFiltro] =
    useState<Moneda>(
      monedas[0] ?? 'COP',
    );

  return (
    <div className="space-y-6">
      <div className="flex gap-5 overflow-x-auto border-b border-gray-200">
        {monedas.map((moneda) => {
          const active =
            monedaFiltro === moneda;

          return (
            <button
              key={moneda}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() =>
                setMonedaFiltro(moneda)
              }
              className={[
                'shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors',
                active
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800',
              ].join(' ')}
            >
              {moneda}
            </button>
          );
        })}
      </div>

      <CarteraSummary
        cartera={cartera}
        moneda={monedaFiltro}
      />

      <CarteraTable
        cartera={cartera}
        moneda={monedaFiltro}
      />
    </div>
  );
}