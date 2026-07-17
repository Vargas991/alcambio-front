import 'server-only';

import { cookies } from 'next/headers';

import type { ApiResponse } from '@/types/operaciones';
import type {
  CarteraClienteItem,
  CarteraResponse,
  ClienteLedgerResponse,
  ClientePerfil,
  ClienteResumenItem,
} from '@/types/clientes';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3000/api';

export type GetClienteLedgerServerParams = {
  tipo?: string;
  estado?: string;
  tipoMov?: string;
  moneda?: string;
  desde?: string;
  hasta?: string;
  buscar?: string;
};

async function serverApiGet<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    throw new Error('No autenticado.');
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.message ?? 'Error consultando el backend.');
  }

  return json;
}

function buildQueryParams(params?: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

export async function getClientesServer() {
  const response =
    await serverApiGet<ApiResponse<ClienteResumenItem[]>>('/clientes');

  return response.data
    .filter((cliente) => cliente.estado === 'ACTIVO')
    .sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', {
        sensitivity: 'base',
      }),
    );
}

export async function getClientePerfilServer(id: string) {
  const response = await serverApiGet<ApiResponse<ClientePerfil>>(
    `/clientes/${id}/perfil`,
  );

  return response.data;
}

export async function getClienteLedgerServer(
  id: string,
  params?: GetClienteLedgerServerParams,
) {
  const query = buildQueryParams(params);

  const response = await serverApiGet<ApiResponse<ClienteLedgerResponse>>(
    `/clientes/${id}/ledger${query}`,
  );

  return response.data;
}

export async function getCarteraServer() {
  const response =
    await serverApiGet<ApiResponse<CarteraResponse>>('/clientes/cartera');

  const sortByNombre = (items: CarteraClienteItem[]) =>
    [...items].sort((a, b) =>
      a.cliente.nombre.localeCompare(b.cliente.nombre, 'es', {
        sensitivity: 'base',
      }),
    );

  return {
    resumen: response.data.resumen,
    meDeben: sortByNombre(response.data.meDeben),
    lesDebo: sortByNombre(response.data.lesDebo),
  };
}