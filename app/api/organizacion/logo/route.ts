import { NextResponse } from 'next/server';

const API_PUBLIC_URL =
  process.env.NEST_PUBLIC_URL ??
  process.env.NEXT_PUBLIC_NEST_API_URL;

export async function GET() {
  if (!API_PUBLIC_URL) {
    return NextResponse.json(
      {
        message:
          'No está configurada la URL pública del backend.',
      },
      {
        status: 500,
      },
    );
  }

  const identidadResponse = await fetch(
    `${API_PUBLIC_URL.replace(/\/api\/?$/, '')}/api/configuracion/organizacion/publica`,
    {
      cache: 'no-store',
    },
  );

  if (!identidadResponse.ok) {
    return NextResponse.json(
      {
        message:
          'No fue posible obtener la identidad.',
      },
      {
        status: identidadResponse.status,
      },
    );
  }

  const responseJson =
    await identidadResponse.json();

  const identidad =
    responseJson.data ?? responseJson;

  if (!identidad.logoUrl) {
    return NextResponse.json(
      {
        message:
          'La organización no tiene logo.',
      },
      {
        status: 404,
      },
    );
  }

  const baseUrl =
    API_PUBLIC_URL.replace(
      /\/api\/?$/,
      '',
    ).replace(/\/+$/, '');

  const logoUrl =
    identidad.logoUrl.startsWith(
      'http',
    )
      ? identidad.logoUrl
      : `${baseUrl}${
          identidad.logoUrl.startsWith('/')
            ? identidad.logoUrl
            : `/${identidad.logoUrl}`
        }`;

  const imageResponse =
    await fetch(logoUrl, {
      cache: 'no-store',
    });

  if (!imageResponse.ok) {
    return NextResponse.json(
      {
        message:
          'No fue posible cargar el logo.',
      },
      {
        status: imageResponse.status,
      },
    );
  }

  const imageBuffer =
    await imageResponse.arrayBuffer();

  return new NextResponse(
    imageBuffer,
    {
      status: 200,
      headers: {
        'Content-Type':
          imageResponse.headers.get(
            'content-type',
          ) ?? 'image/webp',

        'Cache-Control':
          'public, max-age=300',
      },
    },
  );
}