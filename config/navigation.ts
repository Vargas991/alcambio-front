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
} from 'react-icons/fi';

export const mainNavigation = [
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

export const secondaryNavigation = [
  {
    label: 'Perfil',
    href: '/dashboard/perfil',
    icon: FiUser,
  }
];