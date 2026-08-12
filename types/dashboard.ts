export type DashboardMoneda =
  | 'COP'
  | 'BS'
  | 'USD'
  | 'USDT';

export type DashboardCajaDia = {
  saldoInicial: number;
  entradas: number;
  salidas: number;
  variacion: number;
  saldoFinal: number;
};

export type DashboardCarteraMoneda = {
  moneda: DashboardMoneda;
  porCobrar: number;
  porPagar: number;
  balanceNeto: number;
};

export type DashboardUtilidadMoneda = {
  moneda: DashboardMoneda;
  utilidad: number;
};

export type DashboardResumenMoneda = {
  moneda: DashboardMoneda;

  saldoCuentas: number;

  cartera: {
    porCobrar: number;
    porPagar: number;
    balanceNeto: number;
  };

  cajaDia: DashboardCajaDia;

  utilidadGenerada: number;

  cantidadCuentas: number;
  cantidadMovimientos: number;
};

export type DashboardCuenta = {
  id: string;
  nombre: string;
  moneda: DashboardMoneda;

  categoria: string;
  tipo: string;

  aplica4x1000: boolean;

  saldoActual: number;

  saldoInicial: number;
  entradas: number;
  salidas: number;
  variacion: number;
  saldoFinal: number;

  utilidadGenerada: number;

  cantidadMovimientos: number;
};

export type DashboardMovimiento = {
  id: string;

  cuentaId: string;

  tipo: string;

  descripcion:
    | string
    | null;

  referenciaTipo:
    | string
    | null;

  referenciaId:
    | string
    | null;

  moneda: DashboardMoneda;

  monto: number;

  entrada: number;
  salida: number;

  saldoAnterior: number;
  saldoNuevo: number;

  creadoEn: string;
};

export type DashboardResumen = {
  fecha: string;

  monedasDisponibles:
    DashboardMoneda[];

  resumenPorMoneda:
    DashboardResumenMoneda[];

  cuentas:
    DashboardCuenta[];

  utilidadPorMoneda:
    DashboardUtilidadMoneda[];

  carteraPorMoneda:
    DashboardCarteraMoneda[];

  movimientos:
    DashboardMovimiento[];

  generadoEn: string;
};
