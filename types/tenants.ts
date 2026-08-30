import type { ConfiguracionOrganizacion } from './configuracion';
import type { Usuario } from './usuarios';

export type Tenant = {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  fechaActivacion?: string | null;
  fechaRenovacion: string | null;
  periodoRenovacion?: 'MENSUAL' | 'ANUAL';
  creadoEn: string;
  actualizadoEn: string;
  configuracion?: ConfiguracionOrganizacion | null;
  usuarios?: Pick<Usuario, 'id' | 'nombre' | 'correo' | 'rol' | 'estado'>[];
  pagos?: PagoTenant[];
  _count?: {
    usuarios: number;
  };
};

export type CrearTenantInput = {
  nombre: string;
  slug?: string;
  activo?: boolean;
  fechaActivacion?: string;
  fechaRenovacion?: string;
  periodoRenovacion?: Tenant['periodoRenovacion'];
};

export type ActualizarTenantInput = Partial<CrearTenantInput>;

export type PagoTenant = {
  id: string;
  tenantId: string;
  monto: string;
  moneda: 'COP' | 'BS' | 'USD' | 'USDT';
  fechaPago: string;
  referencia: string | null;
  notas: string | null;
  creadoEn: string;
};
