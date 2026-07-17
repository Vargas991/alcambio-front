import 'server-only';

import { cookies } from 'next/headers';

import type {
  ApiResponse,
  Cliente,
  EstadoOperacion,
  Moneda,
  Operacion,
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
};

function buildQueryParams(params?: GetOperacionesServerParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
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
) {
  const query = buildQueryParams(params);

  const response = await serverApiGet<ApiResponse<Operacion[]>>(
    `/operaciones${query}`,
  );

  return response.data;
}

export async function getClientesServer() {
  const response = await serverApiGet<ApiResponse<Cliente[]>>('/clientes');

  return response.data;
}

export async function getCuentasServer() {
  const response = await serverApiGet<ApiResponse<Cuenta[]>>('/cuentas');

  return response.data;
}

