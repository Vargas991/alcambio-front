'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLock, FiMail } from 'react-icons/fi';
import axios from 'axios';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');
    setLoading(true);

    try {
      await axios.post('/api/auth/login', {
        correo,
        password,
      });

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ?? 'Credenciales inválidas.',
        );
      } else {
        setErrorMessage('No fue posible iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">AlCambio</h1>
        <p className="mt-2 text-sm text-gray-500">
          Ingresa tus credenciales para continuar.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Correo
        </label>

        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            placeholder="admin@alcambio.com"
            className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Contraseña
        </label>

        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="********"
            className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:shadow-lg hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}