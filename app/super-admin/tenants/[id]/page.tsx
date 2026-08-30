import { TenantDetailManager } from '@/components/super-admin/TenantDetailManager';
import {
  getTenantConfiguracionServer,
  getTenantPagosServer,
  getTenantServer,
  getTenantUsuariosServer,
} from '@/services/tenants.server';

type TenantDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps) {
  const { id } = await params;
  const [tenant, configuracion, usuarios, pagos] = await Promise.all([
    getTenantServer(id),
    getTenantConfiguracionServer(id),
    getTenantUsuariosServer(id),
    getTenantPagosServer(id),
  ]);

  return (
    <TenantDetailManager
      tenant={tenant}
      configuracion={configuracion}
      usuarios={usuarios}
      pagos={pagos}
    />
  );
}
