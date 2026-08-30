import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { getAuthUserServer } from '@/services/auth.server';

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAuthUserServer();

  if (!user) {
    redirect('/login?callbackUrl=/super-admin/tenants');
  }

  if (user.rol !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/super-admin/tenants" className="font-bold text-gray-900">
            Super Admin
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.correo}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
