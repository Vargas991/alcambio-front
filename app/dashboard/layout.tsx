// app/(private)/layout.tsx

import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getAuthUserServer } from '@/services/auth.server';

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {

  const user = await getAuthUserServer();
  console.log("current: ",user);
  
  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}