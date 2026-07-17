'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';

export function OperacionesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollRef = useRef(false);
  const paramsKey = searchParams.toString();

  const [buscar, setBuscar] = useState(searchParams.get('buscar') ?? '');
  const [tipo, setTipo] = useState(searchParams.get('tipo') ?? '');
  const [estado, setEstado] = useState(searchParams.get('estado') ?? '');
  const [moneda, setMoneda] = useState(searchParams.get('moneda') ?? '');
  const [desde, setDesde] = useState(searchParams.get('desde') ?? '');
  const [hasta, setHasta] = useState(searchParams.get('hasta') ?? '');

  function scrollToFilters() {
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  useEffect(() => {
    if (!shouldScrollRef.current) return;

    shouldScrollRef.current = false;
    scrollToFilters();
  }, [paramsKey]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (buscar.trim()) params.set('buscar', buscar.trim());
    if (tipo) params.set('tipo', tipo);
    if (estado) params.set('estado', estado);
    if (moneda) params.set('moneda', moneda);
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);

    const query = params.toString();

    const href = query ? `${pathname}?${query}` : pathname;

    shouldScrollRef.current = true;
    router.push(href, { scroll: false });

    if (query === paramsKey) {
      shouldScrollRef.current = false;
      scrollToFilters();
    }
  }

  function handleClear() {
    setBuscar('');
    setTipo('');
    setEstado('');
    setMoneda('');
    setDesde('');
    setHasta('');
    shouldScrollRef.current = true;
    router.push(pathname, { scroll: false });

    if (!paramsKey) {
      shouldScrollRef.current = false;
      scrollToFilters();
    }
  }

  return (
    <section ref={sectionRef} className="rounded-xl bg-white p-3 shadow-md">
      {/* <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Filtros</h2>
        {/* <p className="text-sm text-gray-500">
          Consulta operaciones por fecha, tipo, estado, moneda o búsqueda.
        </p> */}
      {/* </div> */}
      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-12 items-center content-center">
        {/* <div className="lg:col-span-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Buscar
          </label>

          <input
            value={buscar}
            onChange={(event) => setBuscar(event.target.value)}
            placeholder="Código, cliente, nota..."
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div> */}

        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Tipo
          </label>

          <select
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos</option>
            <option value="VENTA">Venta</option>
            <option value="OPERACION_DIRECTA">Directa</option>
            <option value="COMPRA">Compra</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Estado
          </label>

          <select
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todos</option>
            <option value="REGISTRADA">Registrada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        {/* <div className="lg:col-span-1">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Moneda
          </label>

          <select
            value={moneda}
            onChange={(event) => setMoneda(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Todas</option>
            <option value="BS">BS</option>
            <option value="USD">USD</option>
            <option value="USDT">USDT</option>
            <option value="COP">COP</option>
          </select>
        </div> */}

        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Desde
          </label>

          <input
            type="date"
            value={desde}
            onChange={(event) => setDesde(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Hasta
          </label>

          <input
            type="date"
            value={hasta}
            onChange={(event) => setHasta(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center justify-center gap-2 lg:col-span-4">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:shadow-blue-500/40"
          >
            <FiFilter className="h-4 w-4" />
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <FiRefreshCw className="h-4 w-4" />
            Limpiar
          </button>
        </div>
      </form>
    </section>
  );
}
