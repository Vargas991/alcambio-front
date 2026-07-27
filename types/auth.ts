export type AuthUser = {
  id: string;
  nombre: string;
  correo: string;
  rol: 'ADMIN' | 'OPERADOR' | 'VISOR';
  estado: 'ACTIVO' | 'INACTIVO';
};