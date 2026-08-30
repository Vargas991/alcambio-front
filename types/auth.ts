export type AuthUser = {
  id: string;
  nombre: string;
  correo: string;
  rol: 'SUPER_ADMIN' | 'ADMIN' | 'OPERADOR' | 'VISOR';
  estado: 'ACTIVO' | 'INACTIVO';
  tenantId: string | null;
  tenant?: {
    id: string;
    nombre: string;
    slug: string;
    activo: boolean;
  } | null;
};
