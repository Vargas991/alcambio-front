'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type LedgerFiltersState = {
  tipoMov: string;
  tipo: string;
  estado: string;
  moneda: string;
  metodoCalculo: string;
  desde: string;
  hasta: string;
  buscar: string;
};

export function ClienteLedgerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<LedgerFiltersState>({
    tipoMov: searchParams.get('tipoMov') ?? '',
    tipo: searchParams.get('tipo') ?? '',
    estado: searchParams.get('estado') ?? '',
    moneda: searchParams.get('moneda') ?? '',
    metodoCalculo: searchParams.get('metodoCalculo') ?? '',
    desde: searchParams.get('desde') ?? '',
    hasta: searchParams.get('hasta') ?? '',
    buscar: searchParams.get('buscar') ?? '',
  });

  function updateFilter(
    key: keyof LedgerFiltersState,
    value: string,
  ) {
    setFilters((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      /**
       * El método de cálculo únicamente aplica
       * a movimientos de tipo OPERACION.
       *
       * Si seleccionamos otro tipo de movimiento,
       * limpiamos automáticamente los filtros
       * propios de operaciones.
       */
      if (
        key === 'tipoMov' &&
        value &&
        value !== 'OPERACION'
      ) {
        next.tipo = '';
        next.estado = '';
        next.metodoCalculo = '';
      }

      return next;
    });
  }

  function applyFilters() {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(
      ([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      },
    );

    const query = params.toString();

    router.push(query ? `?${query}` : '?');
  }

  function clearFilters() {
    setFilters({
      tipoMov: '',
      tipo: '',
      estado: '',
      moneda: '',
      metodoCalculo: '',
      desde: '',
      hasta: '',
      buscar: '',
    });

    router.push('?');
  }

  const filtrosOperacionHabilitados =
    !filters.tipoMov ||
    filters.tipoMov === 'OPERACION';

  return (
    <section className="rounded-xl bg-white p-6 shadow-md">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          Filtros del estado de cuenta
        </h2>

        <p className="text-sm text-gray-500">
          Filtra movimientos, operaciones, monedas y método de cálculo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-500">
            Movimiento
          </span>

          <select
            value={filters.tipoMov}
            onChange={(event) =>
              updateFilter(
                'tipoMov',
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Todos</option>
            <option value="OPERACION">
              Operaciones
            </option>
            <option value="ABONO">
              Entradas · Abonos
            </option>
            <option value="ABONO_DIRECTO">
              Entradas · Abonos directos
            </option>
            <option value="PAGO">
              Salidas · Pagos
            </option>
            <option value="CANCELACION">
              Cancelaciones
            </option>
            <option value="AJUSTE">
              Ajustes
            </option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-500">
            Método
          </span>

          <select
            value={filters.metodoCalculo}
            onChange={(event) =>
              updateFilter(
                'metodoCalculo',
                event.target.value,
              )
            }
            disabled={
              !filtrosOperacionHabilitados
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              Todos
            </option>
            <option value="TASA">
              Tasa
            </option>
            <option value="PORCENTAJE">
              Porcentaje
            </option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-500">
            Tipo operación
          </span>

          <select
            value={filters.tipo}
            onChange={(event) =>
              updateFilter(
                'tipo',
                event.target.value,
              )
            }
            disabled={
              !filtrosOperacionHabilitados
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">Todas</option>
            <option value="VENTA">
              Venta
            </option>
            <option value="COMPRA">
              Compra
            </option>
            <option value="OPERACION_DIRECTA">
              Operación directa
            </option>
          </select>
        </label>

        {/* <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-500">
            Estado
          </span>

          <select
            value={filters.estado}
            onChange={(event) =>
              updateFilter(
                'estado',
                event.target.value,
              )
            }
            disabled={
              !filtrosOperacionHabilitados
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">Todos</option>
            <option value="REGISTRADA">
              Registrada
            </option>
            <option value="CANCELADA">
              Cancelada
            </option>
          </select>
        </label> */}

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-500">
            Moneda
          </span>

          <select
            value={filters.moneda}
            onChange={(event) =>
              updateFilter(
                'moneda',
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Todas</option>
            <option value="COP">COP</option>
            <option value="BS">BS</option>
            <option value="USD">USD</option>
            <option value="USDT">USDT</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-500">
            Desde
          </span>

          <input
            type="date"
            value={filters.desde}
            onChange={(event) =>
              updateFilter(
                'desde',
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-gray-500">
            Hasta
          </span>

          <input
            type="date"
            value={filters.hasta}
            onChange={(event) =>
              updateFilter(
                'hasta',
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Aplicar filtros
        </button>

        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Limpiar
        </button>
      </div>
    </section>
  );
}