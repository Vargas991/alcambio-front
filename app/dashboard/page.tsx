import { DashboardResumen } from '@/components/dashboard/DashboardResumen';
import { getDashboardServer } from '@/services/dashboard.server';

export default async function DashboardPage() {
  const dashboard =
    await getDashboardServer();

  return (
    <DashboardResumen
      initialData={dashboard}
    />
  );
}
