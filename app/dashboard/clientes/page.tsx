import { ClienteNombreFilter } from '@/components/clientes/ClienteNombreFilter';
import { ClientesManager } from '@/components/clientes/ClientesManager';

import { getClientesServer } from '@/services/clientes.server';

type ClientesPageProps = {
  searchParams: Promise<{
    nombre?: string;
  }>;
};

export default async function ClientesPage({
  searchParams,
}: ClientesPageProps) {
  const params =
    await searchParams;

  const clientes =
    await getClientesServer(
      params.nombre,
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Clientes
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Gestiona clientes y proveedores del sistema.
        </p>
      </div>

      <ClienteNombreFilter />

      <ClientesManager
        clientes={clientes}
      />
    </div>
  );
}