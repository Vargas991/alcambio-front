import type { Cuenta } from '@/types/cuentas';
import type { ClienteResumenItem } from '@/types/clientes';

export type TipoSalida = 'PAGO_ACREEDOR' | 'GASTO' | 'RETIRO';

export type EstadoSalida = 'REGISTRADA' | 'CANCELADA';

export type Salida = {
  id: string;
  tipo: TipoSalida;
  estado: EstadoSalida;

  acreedorId: string | null;
  cuentaId: string;

  montoCop: string;

  montoBaseCop?: string;
  proveedorCobra4x1000?: boolean;
  impuestoProveedor4x1000Cop?: string;
  montoEnviadoCop?: string;
  cuentaAplica4x1000?: boolean;
  impuestoCuenta4x1000Cop?: string;
  totalDebitadoCop?: string;

  descripcion: string | null;
  referencia: string | null;
  notas: string | null;

  creadoEn: string;
  actualizadoEn: string;

  acreedor?: ClienteResumenItem | null;
  cuenta?: Cuenta | null;
};

export type CreateSalidaPayload = {
  tipo: TipoSalida;
  acreedorId?: string;
  cuentaId: string;
  montoCop: number;
  proveedorCobra4x1000?: boolean;
  descripcion?: string | null;
  referencia?: string | null;
  notas?: string | null;
};

export type CancelarSalidaPayload = {
  motivo: string;
};