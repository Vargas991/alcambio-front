import { LoginForm } from '@/components/auth/LoginForm';

type LoginPageProps = {
  searchParams: Promise<{
    tenant?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { tenant } = await searchParams;
  const identidad = {
    nombre: 'Sistema Gestion',
    logoUrl: '/favicon.ico',
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <LoginForm
        identidad={identidad}
        tenantSlug={tenant}
      />
    </main>
  );
}
