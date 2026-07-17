"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function isActiveRoute(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  if (href === '/dashboard') {
    return pathname === '/dashboard';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarItem({ href, label, icon: Icon }: Props) {
   const pathname = usePathname();

   const active = isActiveRoute(pathname, href);

  return (
    <li key={href}>
      <Link href={href}>
        <button
          type="button"
          className={[
            `flex w-full items-center gap-4 rounded-lg px-4 py-3 text-xs font-bold capitalize transition-all`,
             active 
              ? "bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40"
              : "text-white hover:bg-white/10 active:bg-white/30",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
          <span className="font-sans text-base font-medium leading-relaxed">
            {label}
          </span>
        </button>
      </Link>
    </li>
  );
}
