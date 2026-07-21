import PerfilCliente from '@/components/clientes/PerfilCliente';
import { ClientePerfilTabs } from '@/components/clientes/ClientePerfilTabs';
import {
  getClienteLedgerServer,
  getClientePerfilServer,
  getClientesServer,
} from '@/services/clientes.server';
import { getCuentasServer, getOperacionesServer } from '@/services/operaciones.server';
import type {
  EstadoOperacion,
  Moneda,
  TipoOperacion,
} from '@/types/operaciones';
import { getPromedioCompraCuentasServer } from '@/services/cuentas.server';

type ClienteDetallePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tipo?: TipoOperacion;
    estado?: EstadoOperacion;
    moneda?: Moneda;
    tipoMov?: string;
    desde?: string;
    hasta?: string;
    buscar?: string;
  }>;
};

export default async function ClienteDetallePage({
  params,
  searchParams,
}: ClienteDetallePageProps) {
  const { id } = await params;
  const filters = await searchParams;

  const pdfSearchParams = new URLSearchParams();

  if (filters.desde) pdfSearchParams.set('desde', filters.desde);
  if (filters.hasta) pdfSearchParams.set('hasta', filters.hasta);
  if (filters.tipo) pdfSearchParams.set('tipo', filters.tipo);
  if (filters.estado) pdfSearchParams.set('estado', filters.estado);
  if (filters.tipoMov) pdfSearchParams.set('tipoMov', filters.tipoMov);

  const pdfUrl = `/api/clientes/${id}/ledger/pdf${
    pdfSearchParams.toString() ? `?${pdfSearchParams.toString()}` : ''
  }`;

  const [perfil, operaciones, ledger, clientes, cuentas, promedios] = await Promise.all([
    getClientePerfilServer(id),

    getOperacionesServer({
      clienteId: id,
      tipo: filters.tipo,
      estado: filters.estado,
      moneda: filters.moneda,
      desde: filters.desde,
      hasta: filters.hasta,
      buscar: filters.buscar,
    }),

    getClienteLedgerServer(id, {
      tipo: filters.tipo,
      estado: filters.estado,
      moneda: filters.moneda,
      tipoMov: filters.tipoMov,
      desde: filters.desde,
      hasta: filters.hasta,
      buscar: filters.buscar,
    }),
    getClientesServer(),
    getCuentasServer(),
    getPromedioCompraCuentasServer(),
  ]);

  const cuentasBaseCop = cuentas.filter(
  (cuenta) =>
    cuenta.estado === 'ACTIVO' &&
    cuenta.categoria === 'BASE_COP' &&
    cuenta.moneda === 'COP',
);

  const { cliente, balance } = perfil;

  return (
    <div className="space-y-4">
      <PerfilCliente 
        cliente={cliente} 
        balance={balance} 
        pdfUrl={pdfUrl}
        clientes={clientes}
        cuentas={cuentasBaseCop}  
      />

      <ClientePerfilTabs
        operaciones={operaciones}
        movimientos={ledger.movimientos}
        promedios={promedios}
        cuentas={cuentas}
        clientes={clientes}
      />
    </div>
  );
}