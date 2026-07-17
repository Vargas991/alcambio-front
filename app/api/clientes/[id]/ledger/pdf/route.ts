import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3001/api';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;

    const allowedParams = new URLSearchParams();

    const desde = request.nextUrl.searchParams.get('desde');
    const hasta = request.nextUrl.searchParams.get('hasta');
    const tipo = request.nextUrl.searchParams.get('tipo');
    const estado = request.nextUrl.searchParams.get('estado');

    if (desde) allowedParams.set('desde', desde);
    if (hasta) allowedParams.set('hasta', hasta);
    if (tipo) allowedParams.set('tipo', tipo);
    if (estado) allowedParams.set('estado', estado);

    const query = allowedParams.toString();

    const backendUrl = `${API_URL}/clientes/${id}/ledger/pdf${
      query ? `?${query}` : ''
    }`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          success: false,
          message: errorText || 'No fue posible generar el PDF.',
        },
        { status: response.status },
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="cliente-${id}-ledger.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno generando el PDF.',
      },
      { status: 500 },
    );
  }
}