export type RolUsuario =
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
  creadoEn: string;
  actualizadoEn: string;
};