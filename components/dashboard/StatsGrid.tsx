import {
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiDollarSign,
  FiBriefcase,
} from 'react-icons/fi';

import { StatCard } from './StatCard';

export function StatsGrid() {
  return (
    <div className="mb-12 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Saldo cuentas COP"
        value="$2.500.000"
        trend="+12%"
        trendColor="green"
        description="respecto a ayer"
        icon={FiBriefcase}
        color="blue"
      />

      <StatCard
        title="Me deben"
        value="$900.000"
        trend="+5%"
        trendColor="green"
        description="cartera por cobrar"
        icon={FiArrowUpCircle}
        color="green"
      />

      <StatCard
        title="Les debo"
        value="$350.000"
        trend="-2%"
        trendColor="red"
        description="cartera por pagar"
        icon={FiArrowDownCircle}
        color="red"
      />

      <StatCard
        title="Utilidad del día"
        value="$300.000"
        trend="+8%"
        trendColor="green"
        description="ventas y directas"
        icon={FiDollarSign}
        color="orange"
      />
    </div>
  );
}