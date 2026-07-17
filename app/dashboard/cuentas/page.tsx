import { CuentasManager } from '@/components/cuentas/CuentasManager';
import { getCuentasServer } from '@/services/cuentas.server';

export default async function CuentasPage() {
  const cuentas = await getCuentasServer();

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-gray-900">Cuentas</h1>

        <p className="mt-1 text-sm text-gray-500">
          Administra cuentas propias, cuentas operativas, saldos y configuración
          de 4x1000.
        </p>
      </section>

      <CuentasManager cuentas={cuentas} />
    </div>
  );
}