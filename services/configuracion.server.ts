import { cookies } from 'next/headers';

import type {
  ConfiguracionOrganizacion,
  IdentidadOrganizacion,
} from '@/types/configuracion';
import { ApiResponse } from '@/types/operaciones';

const API_URL =
  process.env.NEST_API_URL;

export async function getConfiguracionOrganizacionServer(): Promise<ConfiguracionOrganizacion> {
  if (!API_URL) {
    throw new Error(
      'NEST_API_URL no está configurada.',
    );
  }

  const cookieStore =
    await cookies();

  const accessToken =
    cookieStore.get(
      'accessToken',
    )?.value;

  const response = await fetch(
    `${API_URL}/configuracion/organizacion`,
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      'No fue posible cargar la configuración de la organización.',
    );
  }

  return response.json();
}

export async function getIdentidadOrganizacionServer(): Promise<IdentidadOrganizacion> {
  if (!API_URL) {
    return {
      nombre: 'Al Cambio',
      logoUrl: null,
    };
  }

  const response = await fetch(
    `${API_URL}/configuracion/organizacion/publica`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      'No fue posible cargar la identidad de la organización.',
    );
  }

  const result =
    (await response.json()) as ApiResponse<IdentidadOrganizacion>;

    console.log(result);
    
  return result.data;
}