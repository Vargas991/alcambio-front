import 'server-only';

import { cookies } from 'next/headers';

import type {
  ApiResponse,
  Cliente,
  EstadoOperacion,
  Moneda,
  Operacion,
  PaginatedOperaciones,
  TipoOperacion,
} from '@/types/operaciones';
import { Cuenta } from '@/types/cuentas';



const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3000/api';

export type GetOperacionesServerParams = {
  tipo?: TipoOperacion;
  estado?: EstadoOperacion;
  moneda?: Moneda;
  deudorId?: string;
  acreedorId?: string;
  clienteId?: string;
  cuentaOperativaId?: string;
  desde?: string;
  hasta?: string;
  buscar?: string;
  page?: number;
  pageSize?: number;
};

function buildQueryParams(params?: GetOperacionesServerParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

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

export async function getOperacionesServer(
  params?: GetOperacionesServerParams,
): Promise<PaginatedOperaciones> {
  const query = buildQueryParams(params);

  const response = await serverApiGet<ApiResponse<PaginatedOperaciones>>(
    `/operaciones${query}`,
  );

  const data = response.data;

  if (Array.isArray(data)) {
    return {
      items: data,
      meta: {
        page: 1,
        pageSize: data.length,
        total: data.length,
        totalPages: 1,
      },
    };
  }

  return data;
}

export async function getClientesServer() {
  const response = await serverApiGet<ApiResponse<Cliente[]>>('/clientes');

  return response.data;
}

export async function getCuentasServer() {
  const response = await serverApiGet<ApiResponse<Cuenta[]>>('/cuentas');

  return response.data;
}

