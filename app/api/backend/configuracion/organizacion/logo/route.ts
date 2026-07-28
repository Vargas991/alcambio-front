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

export async function POST(
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

  const formData =
    await request.formData();

  const response = await fetch(
    `${API_URL}/configuracion/organizacion/logo`,
    {
      method: 'POST',

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },

      body: formData,
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

export async function DELETE() {
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
    `${API_URL}/configuracion/organizacion/logo`,
    {
      method: 'DELETE',

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
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