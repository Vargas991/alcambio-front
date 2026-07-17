import { EntradasManager } from '@/components/entradas/EntradasManager';
import { getClientesServer } from '@/services/clientes.server';
import { getCuentasServer } from '@/services/cuentas.server';
import { getEntradasServer } from '@/services/entradas.server';

export default async function EntradasPage() {
  const [entradas, clientes, cuentas] = await Promise.all([
    getEntradasServer(),
    getClientesServer(),
    getCuentasServer(),
  ]);

  const cuentasBaseCop = cuentas.filter(
    (cuenta) =>
      cuenta.estado === 'ACTIVO' &&
      cuenta.categoria === 'BASE_COP' &&
      cuenta.moneda === 'COP',
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-gray-900">Entradas</h1>

        <p className="mt-1 text-sm text-gray-500">
          Registra abonos a cuentas propias y abonos directos a proveedores.
        </p>
      </section>

      <EntradasManager
        entradas={entradas}
        clientes={clientes}
        cuentas={cuentasBaseCop}
      />
    </div>
  );
}