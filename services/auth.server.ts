import 'server-only';

import { cookies } from 'next/headers';

import type { AuthUser } from '@/types/auth';

const API_URL =
  process.env.NEST_API_URL ??
  'http://localhost:3000/api';

async function serverApiGet<T>(
  path: string,
): Promise<T> {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    throw new Error('No autenticado.');
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      cache: 'no-store',
    },
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json?.message ??
        'Error consultando el backend.',
    );
  }

  return json;
}

/**
 * Retorna el usuario autenticado.
 *
 * Backend:
 * GET /api/auth/me
 */


export async function getAuthUserServer(): Promise<AuthUser | null> {
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

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    return null;
  }

  if (!response.ok) {
    const json =
      await response
        .json()
        .catch(() => null);

    throw new Error(
      json?.message ??
        'Error consultando el backend.',
    );
  }

  const json =
    await response.json();

  return json.data ?? json;
}

/**
 * Variante segura.
 *
 * En vez de lanzar error si no existe
 * sesión, retorna null.
 *
 * Útil para layouts.
 */
export async function getAuthUserSafeServer(): Promise<AuthUser | null> {
  try {
    return await getAuthUserServer();
  } catch {
    return null;
  }
}