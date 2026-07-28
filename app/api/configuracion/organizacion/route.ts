import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  cookies,
} from 'next/headers';

const API_URL =
  process.env.NEST_API_URL;

async function getAccessToken() {
  const cookieStore =
    await cookies();

  return cookieStore.get(
    'accessToken',
  )?.value;
}

export async function GET() {
  if (!API_URL) {
    return NextResponse.json(
      {
        message:
          'NEST_API_URL no está configurada.',
      },
      {
        status: 500,
      },
    );
  }

  const accessToken =
    await getAccessToken();

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

  const data =
    await response.json();

  return NextResponse.json(
    data,
    {
      status: response.status,
    },
  );
}

export async function PATCH(
  request: NextRequest,
) {
  if (!API_URL) {
    return NextResponse.json(
      {
        message:
          'NEST_API_URL no está configurada.',
      },
      {
        status: 500,
      },
    );
  }

  const accessToken =
    await getAccessToken();

  const body =
    await request.json();

  const response = await fetch(
    `${API_URL}/configuracion/organizacion`,
    {
      method: 'PATCH',

      headers: {
        Authorization:
          `Bearer ${accessToken}`,

        'Content-Type':
          'application/json',
      },

      body: JSON.stringify(
        body,
      ),
    },
  );

  const data =
    await response.json();

  return NextResponse.json(
    data,
    {
      status: response.status,
    },
  );
}