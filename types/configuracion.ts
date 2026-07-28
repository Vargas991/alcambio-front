export type ConfiguracionOrganizacion = {
  id: string;

  nombre: string;
  logoUrl: string | null;

  telefono: string | null;
  correo: string | null;
  direccion: string | null;

  monedaBase: 'COP' | 'BS' | 'USD' | 'USDT';
  zonaHoraria: string;

  creadoEn: string;
  actualizadoEn: string;
};

export type ActualizarConfiguracionOrganizacionInput = {
  nombre: string;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  monedaBase: ConfiguracionOrganizacion['monedaBase'];
  zonaHoraria: string;
};

export type IdentidadOrganizacion = {
  nombre: string;
  logoUrl: string | null;
};