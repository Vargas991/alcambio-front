// app/(private)/layout.tsx

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getAuthUserServer } from '@/services/auth.server';
import { getIdentidadOrganizacionServer, getConfiguracionOrganizacionServer } from '@/services/configuracion.server';
import { redirect } from 'next/navigation';
import OrganizacionProvider from '@/components/organizacion/OrganizacionProvider';

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {

 const [user, identidad, configuracion] = await Promise.all([
  getAuthUserServer(),
  getIdentidadOrganizacionServer(),
  getConfiguracionOrganizacionServer(),
]);

if (!user) {
    redirect(
      '/login?callbackUrl=/dashboard',
    );
  }
  return (
    <OrganizacionProvider configuracion={configuracion}>
      <AppShell user={user} identidad={identidad}>
        {children}
      </AppShell>
    </OrganizacionProvider>
  );
}
