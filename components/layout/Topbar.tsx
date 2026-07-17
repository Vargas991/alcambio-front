'use client';

import {
  FiBell,
  FiMenu,
  FiSearch,
  FiSettings,
  FiUser,
} from 'react-icons/fi';

type TopbarProps = {
  title: string;
  section?: string;
  onOpenSidebar?: () => void;
};

export function Topbar({
  title,
  section = 'Dashboard',
  onOpenSidebar,
}: TopbarProps) {
  return (
    <nav className="block w-full max-w-full rounded-xl bg-transparent px-0 py-1 text-white shadow-none transition-all">
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <nav aria-label="breadcrumb" className="w-max">
            <ol className="flex w-full flex-wrap items-center rounded-md bg-transparent p-0">
              <li className="flex items-center font-sans text-sm font-normal leading-normal text-blue-900">
                <span className="text-sm font-normal text-blue-900 opacity-50">
                  {section}
                </span>
                <span className="mx-2 select-none text-sm text-gray-500">
                  /
                </span>
              </li>

              <li className="flex items-center font-sans text-sm font-normal leading-normal text-blue-900">
                <span className="text-sm font-normal text-gray-900">
                  {title}
                </span>
              </li>
            </ol>
          </nav>

          <h6 className="font-sans text-base font-semibold leading-relaxed tracking-normal text-gray-900">
            {title}
          </h6>
        </div>

        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56">
            <div className="relative h-10 w-full min-w-[200px]">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                className="h-full w-full rounded-[7px] border border-gray-200 bg-transparent px-9 py-2.5 font-sans text-sm font-normal text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-2 focus:border-blue-500"
                placeholder="Buscar..."
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSidebar}
            className="grid h-10 w-10 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-500/10 active:bg-gray-500/30 xl:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>

          <button
            type="button"
            className="hidden items-center gap-1 rounded-lg px-4 py-3 text-xs font-bold uppercase text-gray-500 hover:bg-gray-500/10 active:bg-gray-500/30 xl:flex"
          >
            <FiUser className="h-5 w-5" />
            Admin
          </button>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg text-gray-500 hover:bg-gray-500/10 active:bg-gray-500/30"
          >
            <FiSettings className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg text-gray-500 hover:bg-gray-500/10 active:bg-gray-500/30"
          >
            <FiBell className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}