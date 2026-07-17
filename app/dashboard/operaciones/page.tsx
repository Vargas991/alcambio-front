import { OperacionForm } from '@/components/operaciones/OperacionForm';
import { OperacionesFilters } from '@/components/operaciones/OperacionesFilters';
import { OperacionesTable } from '@/components/operaciones/OperacionesTable';
import {
  getClientesServer,
  getCuentasServer,
  getOperacionesServer,
} from '@/services/operaciones.server';
import type {
  EstadoOperacion,
  Moneda,
  TipoOperacion,
} from '@/types/operaciones';

type OperacionesPageProps = {
  searchParams: Promise<{
    tipo?: TipoOperacion;
    estado?: EstadoOperacion;
    moneda?: Moneda;
    desde?: string;
    hasta?: string;
    buscar?: string;
  }>;
};

export default async function OperacionesPage({
  searchParams,
}: OperacionesPageProps) {
  const filters = await searchParams;

  const [operaciones, clientes, cuentas] = await Promise.all([
    getOperacionesServer({
      tipo: filters.tipo,
      estado: filters.estado,
      moneda: filters.moneda,
      desde: filters.desde,
      hasta: filters.hasta,
      buscar: filters.buscar,
    }),
    getClientesServer(),
    getCuentasServer(),
  ]);

  return (
    <div className="space-y-6">
      <OperacionForm clientes={clientes} cuentas={cuentas} />

      <OperacionesFilters />

      <OperacionesTable operaciones={operaciones} title="Tabla de operaciones" description="Ventas normales y operaciones directas registradas." />
    </div>
  );
}