export type DashboardCuentaBase = {
  id: string;
  nombre: string;
  moneda: string;
  tipo: string;
  saldo: number;
  aplica4x1000: boolean;
};

export type DashboardCuentaOperativa = {
  id: string;
  nombre: string;
  moneda: string;

  saldoActual: number;
  saldoCalculado: number;
  diferenciaSaldo: number;

  promedioCompra: number;
  tasaMinimaVenta: number;

  costoInventarioCalculadoCop: number;
  valorActualCop: number;

  totalOperacionesAnalizadas: number;
};

export type DashboardCuentaCaja = {
  id: string;
  nombre: string;
  moneda: string;
  tipo: string;
  aplica4x1000: boolean;

  saldoInicial: number;
  entradas: number;
  salidas: number;
  variacion: number;
  saldoFinal: number;
  saldoActual: number;

  cantidadMovimientos: number;
};

export type DashboardMovimiento = {
  id: string;
  cuentaId: string;
  tipo: string;
  descripcion: string | null;
  referenciaTipo: string | null;
  referenciaId: string | null;

  moneda: string;
  monto: number;

  entrada: number;
  salida: number;

  saldoAnterior: number;
  saldoNuevo: number;

  creadoEn: string;
};

export type DashboardResumen = {
  fecha: string;

  capital: {
    disponibleCop: number;
    inventarioDivisasCop: number;
    capitalOperativoCop: number;

    resumen: {
      cantidadCuentasBase: number;
      cantidadCuentasOperativas: number;
    };

    cuentasBase: DashboardCuentaBase[];

    cuentasOperativas: DashboardCuentaOperativa[];
  };

  caja: {
    resumen: {
      saldoInicial: number;
      entradas: number;
      salidas: number;
      variacion: number;
      saldoFinal: number;
    };

    cuentas: DashboardCuentaCaja[];

    movimientos: DashboardMovimiento[];
  };

  generadoEn: string;
};