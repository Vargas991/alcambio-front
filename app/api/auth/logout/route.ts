import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete('accessToken');
  cookieStore.delete('userRole');

  return NextResponse.json({
    success: true,
    message: 'Sesión cerrada correctamente.',
  });
}