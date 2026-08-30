export type RolUsuario =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERADOR'
  | 'VISOR';

export type EstadoUsuario =
  | 'ACTIVO'
  | 'INACTIVO';

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  tenantId: string | null;
  tenant?: {
    id: string;
    nombre: string;
    slug: string;
    activo: boolean;
  } | null;
  creadoEn: string;
  actualizadoEn: string;
};
