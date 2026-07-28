import { LoginForm } from '@/components/auth/LoginForm';
import { getIdentidadOrganizacionServer } from '@/services/configuracion.server';

export default async function LoginPage() {
  const identidad =
    await getIdentidadOrganizacionServer();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <LoginForm
        identidad={identidad}
      />
    </main>
  );
}