import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3000/api';

type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    usuario: {
      id: string;
      nombre: string;
      correo: string;
      rol: 'ADMIN' | 'OPERADOR' | 'VISOR';
    };
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/login`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const { accessToken, usuario } = response.data.data;

    const cookieStore = await cookies();

    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    cookieStore.set('userRole', usuario.rol, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return NextResponse.json({
      success: true,
      message: 'Sesión iniciada correctamente.',
      data: {
        usuario,
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data ?? {
          success: false,
          message: 'No fue posible iniciar sesión.',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno al iniciar sesión.',
      },
      { status: 500 },
    );
  }
}