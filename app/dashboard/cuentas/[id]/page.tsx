import Link from 'next/link';

import { CuentaDetalleCard } from '@/components/cuentas/CuentaDetalleCard';
import { CuentaMovimientosTable } from '@/components/cuentas/CuentaMovimientosTable';
import { getCuentaServer, getPromedioCompraCuentaServer } from '@/services/cuentas.server';
import { getClientesServer } from '@/services/clientes.server';
import { CuentaDetalleActions } from '@/components/cuentas/CuentaDetalleActions';

type CuentaDetallePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CuentaDetallePage({
  params,
}: CuentaDetallePageProps) {
  const { id } = await params;

  const [cuenta, clientes, promedioCompra] = await Promise.all([
    getCuentaServer(id),
    getClientesServer(),
    getPromedioCompraCuentaServer(id),
  ]);
  console.log("promedio: ", promedioCompra);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/cuentas"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Volver a cuentas
          </Link>

          <h1 className="mt-2 text-xl font-bold text-gray-900">
            Detalle de cuenta
          </h1>

          <p className="text-sm text-gray-500">
            Consulta saldo, configuración y movimientos recientes.
          </p>
        </div>
      </div>

      
      <CuentaDetalleActions cuenta={cuenta} clientes={clientes} />
      <CuentaDetalleCard cuenta={cuenta} promedioCompra={promedioCompra} />

      <CuentaMovimientosTable movimientos={cuenta.movimientos} />
    </div>
  );
}