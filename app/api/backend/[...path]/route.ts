import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError, Method } from 'axios';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3000/api';

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function handler(request: NextRequest, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'No autenticado.',
        },
        { status: 401 },
      );
    }

    const { path } = await context.params;
    const pathname = path.join('/');

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${API_URL}/${pathname}${searchParams ? `?${searchParams}` : ''}`;

    const contentType = request.headers.get('content-type');

    let body: unknown = undefined;

    if (
      request.method !== 'GET' &&
      request.method !== 'HEAD' &&
      contentType?.includes('application/json')
    ) {
      body = await request.json();
    }

    const response = await axios.request({
      url,
      method: request.method as Method,
      data: body,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json(
        error.response?.data ?? {
          success: false,
          message: 'Error al comunicarse con el backend.',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno en el proxy de Next.',
      },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;