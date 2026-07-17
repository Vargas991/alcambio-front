export type MonedaCuenta = 'COP' | 'BS' | 'USD' | 'USDT';

export type CategoriaCuenta = 'BASE_COP' | 'OPERATIVA';

export type TipoCuenta =
  | 'CAJA'
  | 'OFICINA'
  | 'BANCO'
  | 'ZELLE'
  | 'BINANCE'
  | 'BILLETERA_BS'
  | 'OTRA';

export type EstadoCuenta = 'ACTIVO' | 'INACTIVO';

export type Cuenta = {
  id: string;
  nombre: string;
  moneda: MonedaCuenta;
  categoria: CategoriaCuenta;
  tipo: TipoCuenta;
  saldo: string;
  aplica4x1000: boolean;
  notas: string | null;
  estado: EstadoCuenta;
  creadoEn: string;
  actualizadoEn: string;
};

export type CreateCuentaPayload = {
  nombre: string;
  moneda: MonedaCuenta;
  categoria: CategoriaCuenta;
  tipo: TipoCuenta;
  saldoInicial?: number;
  aplica4x1000?: boolean;
  notas?: string | null;
};

export type UpdateCuentaPayload = {
  nombre?: string;
  tipo?: TipoCuenta;
  aplica4x1000?: boolean;
  notas?: string | null;
};

export type AjustarSaldoCuentaPayload = {
  saldoReal: number;
  descripcion: string;
};

export type UpdateEstadoCuentaPayload = {
  estado: EstadoCuenta;
};