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

  if (pathname.startsWith('/dashboard/cuentas/')) {
    return {
      title: 'Detalle de cuenta',
      section: 'Cuentas',
    };
  }

  return {
    title: 'Panel',
    section: 'Dashboard',
  };
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pageInfo = useMemo(() => {
    return getPageInfo(pathname);
  }, [pathname]);

  function handleOpenSidebar() {
    // Desktop: si está colapsado, expandir.
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      return;
    }

    // Mobile: abrir normalmente.
    setSidebarOpen(true);
  }

  function handleCloseSidebar() {
    setSidebarOpen(false);
  }

  function handleCollapseSidebar() {
    setSidebarCollapsed(true);
  }

  function handleExpandSidebar() {
    setSidebarCollapsed(false);
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={handleCloseSidebar}
        onCollapse={handleCollapseSidebar}
        onExpand={handleExpandSidebar}
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/40 xl:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      <div
        className={[
          'p-4 transition-[margin] duration-300',
          sidebarCollapsed ? 'xl:ml-20' : 'xl:ml-80',
        ].join(' ')}
      >
        <Topbar
          title={pageInfo.title}
          section={pageInfo.section}
          onOpenSidebar={handleOpenSidebar}
        />

        <main className="mt-12">{children}</main>

        <Footer />
      </div>
    </div>
  );
}