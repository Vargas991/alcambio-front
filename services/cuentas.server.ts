import 'server-only';

import { cookies } from 'next/headers';

import type { ApiResponse } from '@/types/operaciones';
import type { Cuenta } from '@/types/cuentas';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3000/api';

export type MovimientoCuenta = {
  id: string;
  cuentaId: string;
  tipo: string;
  monto: string;
  moneda: string;
  saldoAnterior: string;
  saldoNuevo: string;
  descripcion: string | null;
  referenciaTipo: string | null;
  referenciaId: string | null;
  creadoEn: string;
};

export type CuentaDetalle = Cuenta & {
  movimientos: MovimientoCuenta[];
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

export async function getCuentasServer() {
  const response = await serverApiGet<ApiResponse<Cuenta[]>>('/cuentas');

  return response.data.sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es', {
      sensitivity: 'base',
    }),
  );
}

export async function getCuentaServer(id: string) {
  const response = await serverApiGet<ApiResponse<CuentaDetalle>>(
    `/cuentas/${id}`,
  );

  return response.data;
}

export async function getMovimientosCuentaServer(id: string) {
  const response = await serverApiGet<ApiResponse<MovimientoCuenta[]>>(
    `/cuentas/${id}/movimientos`,
  );

  return response.data;
}