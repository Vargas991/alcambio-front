import { cookies } from 'next/headers';
import {
  NextRequest,
  NextResponse,
} from 'next/server';

const API_URL =
  process.env.NEST_API_URL ??
  'http://localhost:3001/api';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'No autenticado.',
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;

    /**
     * Reenviamos únicamente los filtros
     * permitidos hacia NestJS.
     */
    const allowedParams =
      new URLSearchParams();

    const permittedKeys = [
      'desde',
      'hasta',
      'tipo',
      'estado',
      'tipoMov',
      'moneda',
      'metodoCalculo',
    ] as const;

    for (const key of permittedKeys) {
      const value =
        request.nextUrl.searchParams.get(
          key,
        );

      if (value) {
        allowedParams.set(
          key,
          value,
        );
      }
    }

    const query =
      allowedParams.toString();

    const backendUrl =
      `${API_URL}/clientes/${id}/ledger/pdf` +
      (query ? `?${query}` : '');

    const response = await fetch(
      backendUrl,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },

        cache: 'no-store',
      },
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      return NextResponse.json(
        {
          success: false,
          message:
            errorText ||
            'No fue posible generar el PDF.',
        },
        {
          status: response.status,
        },
      );
    }

    const pdfBuffer =
      await response.arrayBuffer();

    return new NextResponse(
      pdfBuffer,
      {
        status: 200,

        headers: {
          'Content-Type':
            'application/pdf',

          'Content-Disposition':
            `inline; filename="cliente-${id}-ledger.pdf"`,

          'Cache-Control':
            'no-store',
        },
      },
    );
  } catch (error) {
    console.error(
      'Error generando PDF:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Error interno generando el PDF.',
      },
      {
        status: 500,
      },
    );
  }
}