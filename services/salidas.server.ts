import 'server-only';

import { cookies } from 'next/headers';

import type { ApiResponse } from '@/types/operaciones';
import type { Salida } from '@/types/salidas';

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

export async function getSalidasServer() {
  const response = await serverApiGet<ApiResponse<Salida[]>>('/salidas');

  return response.data;
}

export async function getSalidaServer(id: string) {
  const response = await serverApiGet<ApiResponse<Salida>>(`/salidas/${id}`);

  return response.data;
}