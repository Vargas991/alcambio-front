import type { Cuenta } from '@/types/cuentas';
import type { ClienteResumenItem } from '@/types/clientes';

export type TipoEntrada = 'ABONO_CUENTA_PROPIA' | 'ABONO_DIRECTO_PROVEEDOR';

export type EstadoEntrada = 'REGISTRADA' | 'CANCELADA';

export type Entrada = {
  id: string;
  tipo: TipoEntrada;
  estado: EstadoEntrada;

  deudorId: string;
  acreedorId: string | null;
  cuentaId: string | null;

  aplica4x1000?: boolean;
  impuesto4x1000Cop?: number;
  montoAplicadoDeudaCop?: number | null;

  montoCop: string;
  proveedorCobra4x1000?: boolean;
  impuestoProveedor4x1000Cop?: string;
  montoNetoAcreedorCop?: string;



  descripcion: string | null;
  referencia: string | null;
  notas: string | null;

  creadoEn: string;
  actualizadoEn: string;

  deudor?: ClienteResumenItem | null;
  acreedor?: ClienteResumenItem | null;
  cuenta?: Cuenta | null;
};

export type CreateEntradaPayload = {
  tipo: TipoEntrada;
  deudorId: string;
  acreedorId?: string;
  cuentaId?: string;
  montoCop: number;
  proveedorCobra4x1000?: boolean;
  descripcion?: string | null;
  referencia?: string | null;
  notas?: string | null;
};

export type CancelarEntradaPayload = {
  motivo: string;
};