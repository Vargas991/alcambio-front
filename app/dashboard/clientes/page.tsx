import { ClientesManager } from '@/components/clientes/ClientesManager';
import { getClientesServer } from '@/services/clientes.server';

export default async function ClientesPage() {
  const clientes = await getClientesServer();

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-gray-900">Clientes</h1>

        <p className="mt-1 text-sm text-gray-500">
          Administra clientes y proveedores registrados en el sistema.
        </p>
      </section>

      <ClientesManager clientes={clientes} />
    </div>
  );
}