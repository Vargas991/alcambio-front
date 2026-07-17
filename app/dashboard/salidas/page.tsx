import { SalidasManager } from '@/components/salidas/SalidasManager';
import { getClientesServer } from '@/services/clientes.server';
import { getCuentasServer } from '@/services/cuentas.server';
import { getSalidasServer } from '@/services/salidas.server';

export default async function SalidasPage() {
  const [salidas, clientes, cuentas] = await Promise.all([
    getSalidasServer(),
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
        <h1 className="text-xl font-bold text-gray-900">Salidas</h1>

        <p className="mt-1 text-sm text-gray-500">
          Registra pagos a acreedores, gastos y retiros desde cuentas propias.
        </p>
      </section>

      <SalidasManager
        salidas={salidas}
        clientes={clientes}
        cuentas={cuentasBaseCop}
      />
    </div>
  );
}