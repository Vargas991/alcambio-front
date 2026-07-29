// app/(private)/layout.tsx

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getAuthUserServer } from '@/services/auth.server';
import { getIdentidadOrganizacionServer } from '@/services/configuracion.server';
import { redirect } from 'next/navigation';

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {

 const [user, identidad] = await Promise.all([
  getAuthUserServer(),
  getIdentidadOrganizacionServer(),
]);

if (!user) {
    redirect(
      '/login?callbackUrl=/dashboard',
    );
  }
  return (
    <AppShell user={user} identidad={identidad}>
      {children}
    </AppShell>
  );
}
