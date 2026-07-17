'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type AppShellProps = {
  children: ReactNode;
};

const pageTitles: Record<string, { title: string; section: string }> = {
  '/dashboard': {
    title: 'Inicio',
    section: 'Dashboard',
  },
  '/dashboard/estado': {
    title: 'Estado',
    section: 'Dashboard',
  },
  '/dashboard/clientes': {
    title: 'Clientes',
    section: 'Gestión',
  },
  '/dashboard/cartera': {
    title: 'Cartera',
    section: 'Finanzas',
  },
  '/dashboard/cuentas': {
    title: 'Cuentas',
    section: 'Finanzas',
  },
  '/dashboard/operaciones': {
    title: 'Operaciones',
    section: 'Movimientos',
  },
  '/dashboard/entradas': {
    title: 'Entradas',
    section: 'Movimientos',
  },
  '/dashboard/salidas': {
    title: 'Salidas',
    section: 'Movimientos',
  },
};

function getPageInfo(pathname: string) {
  const exactMatch = pageTitles[pathname];

  if (exactMatch) {
    return exactMatch;
  }

  if (pathname.startsWith('/dashboard/clientes/')) {
    return {
      title: 'Detalle del cliente',
      section: 'Clientes',
    };
  }

  if (pathname.startsWith('/dashboard/operaciones/')) {
    return {
      title: 'Detalle de operación',
      section: 'Operaciones',
    };
  }

  return {
    title: 'Panel',
    section: 'Dashboard',
  };
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageInfo = useMemo(() => {
    return getPageInfo(pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="p-4 xl:ml-80">
        <Topbar
          title={pageInfo.title}
          section={pageInfo.section}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="mt-12">{children}</main>

        <Footer />
      </div>
    </div>
  );
}