'use client';

import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';

import {
  mainNavigation,
  secondaryNavigation,
} from '@/config/navigation';

import { SidebarItem } from '../dashboard/SidebarItem';
import { LogoutButton } from '../dashboard/LogoutButton';

type SidebarProps = {
  open?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
  onCollapse?: () => void;
  onExpand?: () => void;
};

export function Sidebar({
  open = false,
  collapsed = false,
  onClose,
  onCollapse,
  onExpand,
}: SidebarProps) {
  return (
    <aside
      className={[
        'fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 transition-transform duration-300',

        // Mobile
        open ? 'translate-x-0' : '-translate-x-80',

        // Desktop
        collapsed ? 'xl:-translate-x-60' : 'xl:translate-x-0',
      ].join(' ')}
    >
      <div className="relative border-b border-white/20">
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-4 px-8 py-6"
          >
            <h6 className="font-sans text-base font-semibold leading-relaxed tracking-normal text-white">
              AlCambio
            </h6>
          </Link>
        )}

        {collapsed && (
          <div className="h-[72px]" />
        )}

        {/* Cerrar en móvil */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 grid h-8 w-8 place-items-center rounded-lg rounded-br-none rounded-tl-none text-white hover:bg-white/10 active:bg-white/30 xl:hidden"
          title="Cerrar menú"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Colapsar en desktop */}
        {!collapsed && (
          <button
            type="button"
            onClick={onCollapse}
            className="absolute right-0 top-0 hidden h-8 w-8 place-items-center rounded-lg rounded-br-none rounded-tl-none text-white hover:bg-white/10 active:bg-white/30 xl:grid"
            title="Colapsar menú"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}

        {/* Expandir en desktop */}
        {collapsed && (
          <button
            type="button"
            onClick={onExpand}
            className="absolute right-3 top-4 hidden h-10 w-10 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 xl:grid"
            title="Expandir menú"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="m-4">
          <ul className="mb-4 flex flex-col gap-1">
            {mainNavigation.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
              />
            ))}
          </ul>

          <ul className="mb-4 flex flex-col gap-1">
            <li className="mx-3.5 mb-2 mt-4">
              <p className="font-sans text-sm font-black uppercase leading-normal text-white opacity-75">
                Sistema
              </p>
            </li>

            {secondaryNavigation.map((item) => (
              <SidebarItem
                key={item.href}
                {...item}
              />
            ))}

            <LogoutButton />
          </ul>
        </div>
      )}
    </aside>
  );
}