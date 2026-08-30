import 'server-only';

import { cookies } from 'next/headers';

import type { ConfiguracionOrganizacion } from '@/types/configuracion';
import type { ApiResponse } from '@/types/operaciones';
import type { PagoTenant, Tenant } from '@/types/tenants';
import type { Usuario } from '@/types/usuarios';

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

  return json.data ?? json;
}

export function getTenantsServer() {
  return serverApiGet<ApiResponse<Tenant[]> | Tenant[]>('/super-admin/tenants').then(
    (response) => ('data' in response ? response.data : response),
  );
}

export function getTenantServer(id: string) {
  return serverApiGet<ApiResponse<Tenant> | Tenant>(`/super-admin/tenants/${id}`).then(
    (response) => ('data' in response ? response.data : response),
  );
}

export function getTenantConfiguracionServer(id: string) {
  return serverApiGet<
    ApiResponse<ConfiguracionOrganizacion> | ConfiguracionOrganizacion
  >(`/super-admin/tenants/${id}/configuracion`).then((response) =>
    'data' in response ? response.data : response,
  );
}

export function getTenantUsuariosServer(id: string) {
  return serverApiGet<ApiResponse<Usuario[]> | Usuario[]>(
    `/super-admin/tenants/${id}/usuarios`,
  ).then((response) => ('data' in response ? response.data : response));
}

export function getTenantPagosServer(id: string) {
  return serverApiGet<ApiResponse<PagoTenant[]> | PagoTenant[]>(
    `/super-admin/tenants/${id}/pagos`,
  ).then((response) => ('data' in response ? response.data : response));
}
