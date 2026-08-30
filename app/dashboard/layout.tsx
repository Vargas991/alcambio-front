// app/(private)/layout.tsx

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getAuthUserServer } from '@/services/auth.server';
import { getConfiguracionOrganizacionServer } from '@/services/configuracion.server';
import OrganizacionProvider from '@/components/organizacion/OrganizacionProvider';
import { redirect } from 'next/navigation';

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {

 const user = await getAuthUserServer();

if (!user) {
    redirect(
      '/login?callbackUrl=/dashboard',
    );
  }

  if (user.rol === 'SUPER_ADMIN') {
    redirect('/super-admin/tenants');
  }

  const configuracion =
    await getConfiguracionOrganizacionServer();

  return (
    <OrganizacionProvider configuracion={configuracion}>
      <AppShell user={user} identidad={configuracion}>
        {children}
      </AppShell>
    </OrganizacionProvider>
  );
}
