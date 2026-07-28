import {
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiBarChart2,
  FiCreditCard,
  FiHome,
  FiLogOut,
  FiUser,
  FiUsers,
  FiDollarSign,
  FiSettings,
} from 'react-icons/fi';

type SidebarItemConfig = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  roles?: Array<
    'ADMIN' | 'OPERADOR' | 'VISOR'
  >;
};



export const mainNavigation: SidebarItemConfig[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: FiHome,
  },
  {
    label: 'Operaciones',
    href: '/dashboard/operaciones',
    icon: FiBarChart2,
  },
  {
    label: 'Clientes',
    href: '/dashboard/clientes',
    icon: FiUsers,
  },
  {
    label: 'Cartera',
    href: '/dashboard/cartera',
    icon: FiDollarSign,
  },
  {
    label: 'Cuentas',
    href: '/dashboard/cuentas',
    icon: FiCreditCard,
  },
  {
    label: 'Entradas',
    href: '/dashboard/entradas',
    icon: FiArrowDownCircle,
  },
  {
    label: 'Salidas',
    href: '/dashboard/salidas',
    icon: FiArrowUpCircle,
  },
];

export const secondaryNavigation:SidebarItemConfig[] = [
  // {
  //   label: 'Perfil',
  //   href: '/dashboard/perfil',
  //   icon: FiUser,
  // },
  {
    label: 'Usuarios',
    href: '/dashboard/usuarios',
    icon: FiUsers,
    roles: ['ADMIN']
  },
  {
    label: 'Configuración',
    href: '/dashboard/configuracion/organizacion',
    icon: FiSettings,
    roles: ['ADMIN']
  },
];