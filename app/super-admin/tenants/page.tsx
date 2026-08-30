import { TenantsManager } from '@/components/super-admin/TenantsManager';
import { getTenantsServer } from '@/services/tenants.server';

export default async function SuperAdminTenantsPage() {
  const tenants = await getTenantsServer();

  return <TenantsManager tenants={tenants} />;
}
