import 'server-only';

import { cookies } from 'next/headers';

import type { ApiResponse } from '@/types/operaciones';
import type { Entrada } from '@/types/entradas';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3000/api';

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

export async function getEntradasServer() {
  const response = await serverApiGet<ApiResponse<Entrada[]>>('/entradas');

  return response.data;
}

export async function getEntradaServer(id: string) {
  const response = await serverApiGet<ApiResponse<Entrada>>(`/entradas/${id}`);

  return response.data;
}