'use client';

import { logout } from '@/lib/auth';
import { FiLogOut } from 'react-icons/fi';
export function LogoutButton() {
  const Icon = FiLogOut;
  return (
    <button
      type="button"
      onClick={logout}
      className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-xs font-bold capitalize transition-all text-white hover:bg-white/10 active:bg-white/30"
    >
      <Icon className="h-5 w-5" />
          <span className="font-sans text-base font-medium leading-relaxed">
      Cerrar sesión
          </span>
    </button>
  );
}