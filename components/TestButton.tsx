'use client';

import { api } from '@/lib/api';

export function TestApiButton() {
  async function handleClick() {
    const response = await api.get('/clientes');
    console.log(response.data);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white"
    >
      Probar clientes
    </button>
  );
}