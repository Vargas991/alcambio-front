import { DashboardResumen } from '@/components/dashboard/DashboardResumen';
import type { DashboardResumen as DashboardResumenType } from '@/types/dashboard';

async function getDashboard() {
  const response = await fetch(
    `${process.env.NEST_API_URL}/dashboard/resumen`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      'No fue posible cargar el dashboard.',
    );
  }

  return response.json() as Promise<DashboardResumenType>;
}

export default async function DashboardPage() {
  const dashboard =
    await getDashboard();

  return (
    <DashboardResumen
      initialData={dashboard}
    />
  );
}