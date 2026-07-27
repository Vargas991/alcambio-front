'use client';

import { FormEvent, useState } from 'react';
import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  FiSearch,
  FiX,
} from 'react-icons/fi';

export function ClienteNombreFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [nombre, setNombre] = useState(
    searchParams.get('nombre') ?? '',
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    const buscar =
      nombre.trim();

    if (buscar) {
      params.set(
        'nombre',
        buscar,
      );
    } else {
      params.delete(
        'nombre',
      );
    }

    const query =
      params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  }

  function handleClear() {
    setNombre('');

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.delete('nombre');

    const query =
      params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white p-4 shadow-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={nombre}
            onChange={(event) =>
              setNombre(
                event.target.value,
              )
            }
            placeholder="Buscar cliente por nombre..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          {nombre && (
            <button
              type="button"
              onClick={handleClear}
              title="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiSearch className="h-4 w-4" />
          Buscar
        </button>
      </div>
    </form>
  );
}