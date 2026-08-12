export type ClienteResumenItem = {
  id: string;
  nombre: string;
  documento: string | null;
  telefono: string | null;
  notas?: string | null;
  estado: string;
  creadoEn?: string;
  actualizadoEn?: string;
};

export type ClientePerfil = {
  cliente: {
    id: string;
    nombre: string;
    documento: string | null;
    telefono: string | null;
    notas: string | null;
    estado: string;
    creadoEn: string;
    actualizadoEn: string;
  };

  balance: {
    totalDebitosCop: number;
    totalCreditosCop: number;
    saldoCop: number;
    estado: 'ME_DEBE' | 'LE_DEBO' | 'SALDADO';
    totalUtilidadRealCop: number;
  };
};

export type ClienteLedgerRelacion = {
  id: string;
  nombre: string;
  documento?: string | null;
  telefono?: string | null;
  estado?: string;
};

export type ClienteLedgerCuenta = {
  id: string;
  nombre: string;
  moneda: string;
  categoria?: string;
  tipo?: string;
  saldo?: string | number;
  aplica4x1000?: boolean;
};

export type ClienteLedgerOperacion = {
  id: string;
  codigo: string;
  nombre: string;

  tipo:
    | 'VENTA'
    | 'COMPRA'
    | 'OPERACION_DIRECTA';

  estado: 'REGISTRADA' | 'CANCELADA';

  monedaTransaccion: string;
  montoTransaccion: string | number;

  /**
   * Método de cálculo
   */
  metodoCalculo: 'TASA' | 'PORCENTAJE';

  /**
   * Operaciones por tasa
   */
  tasaCompra: string | number;
  tasaVenta: string | number;

  totalCompraCop: string | number;
  totalVentaCop: string | number;
  utilidadCop: string | number;

  /**
   * Operaciones por porcentaje
   */
  porcentaje?: string | number | null;

  aplicacionPorcentaje?:
    | 'SUMAR'
    | 'DESCONTAR'
    | null;

  montoComision?: string | number | null;
  montoResultado?: string | number | null;

  /**
   * Deuda resultante
   */
  monedaDeuda?: string | null;
  montoDeuda?: string | number | null;

  destinatario?: string | null;
  notas?: string | null;
  fechaOperacion?: string;

  deudor?: {
    id: string;
    nombre: string;
  } | null;

  acreedor?: {
    id: string;
    nombre: string;
  } | null;

  cuentaOperativa?: {
    id: string;
    nombre: string;
    moneda: string;
  } | null;
};

export type ClienteLedgerEntrada = {
  id: string;

  tipo: string;
  estado: string;

  deudorId?: string | null;
  acreedorId?: string | null;
  cuentaId?: string | null;

  /**
   * Legado
   */
  montoCop: string | number;

  /**
   * Multimoneda
   */
  monedaPago: 'COP' | 'BS' | 'USD' | 'USDT';
  montoPago: string | number;

  monedaAplicacion: 'COP' | 'BS' | 'USD' | 'USDT';
  montoAplicado: string | number;

  tasaConversion?: string | number | null;

  aplica4x1000?: boolean;
  impuesto4x1000Cop?: string | number;
  montoAplicadoDeudaCop?: string | number | null;

  proveedorCobra4x1000?: boolean;
  impuestoProveedor4x1000Cop?: string | number;
  montoNetoAcreedorCop?: string | number;

  descripcion?: string | null;
  referencia?: string | null;
  notas?: string | null;

  creadoEn: string;
  actualizadoEn?: string;

  deudor?: ClienteLedgerRelacion | null;
  acreedor?: ClienteLedgerRelacion | null;
  cuenta?: ClienteLedgerCuenta | null;
};

export type ClienteLedgerSalida = {
  id: string;

  tipo: string;
  estado: string;

  acreedorId?: string | null;
  cuentaId?: string | null;

  /**
   * Legado
   */
  montoCop?: string | number;
  montoBaseCop?: string | number;

  /**
   * Multimoneda
   */
  monedaPago: 'COP' | 'BS' | 'USD' | 'USDT';
  montoPago: string | number;

  monedaAplicacion: 'COP' | 'BS' | 'USD' | 'USDT';
  montoAplicado: string | number;

  tasaConversion?: string | number | null;

  proveedorCobra4x1000?: boolean;
  impuestoProveedor4x1000Cop?: string | number;

  montoEnviadoCop?: string | number;

  cuentaAplica4x1000?: boolean;
  impuestoCuenta4x1000Cop?: string | number;

  totalDebitadoCop?: string | number;

  descripcion?: string | null;
  referencia?: string | null;
  notas?: string | null;

  creadoEn: string;
  actualizadoEn?: string;

  acreedor?: ClienteLedgerRelacion | null;
  cuenta?: ClienteLedgerCuenta | null;
};

export type ClienteLedgerEntry = {
  id: string;
  clienteId: string;
  tipo: string;

  operacionId: string | null;
  entradaId: string | null;
  salidaId: string | null;

  /**
   * Datos originales/físicos de la transacción.
   */
  monedaTransaccion: string | null;
  montoTransaccion: number | string | null;

  /**
   * Campos antiguos en COP.
   * Se mantienen por compatibilidad.
   */
  debitoCop: number | string;
  creditoCop: number | string;

  /**
   * Campos multimoneda reales del ledger.
   */
  moneda: 'COP' | 'BS' | 'USD' | 'USDT';

  debito: number | string | null;
  credito: number | string | null;

  saldoAnterior?: number | string | null;
  saldoNuevo?: number | string | null;

  /**
   * Saldo acumulado calculado por el servicio.
   */
  saldoAcumulado?: number | string;
  saldoAcumuladoMoneda?: 'COP' | 'BS' | 'USD' | 'USDT';

  /**
   * Compatibilidad con implementación anterior.
   */
  saldoAcumuladoCop?: number | string;

  utilidadRealCop?: number | string;

  descripcion: string;
  creadoEn: string;

  operacion?: ClienteLedgerOperacion | null;
  entrada?: ClienteLedgerEntrada | null;
  salida?: ClienteLedgerSalida | null;
};

export type BalanceClienteMoneda = {
  moneda: 'COP' | 'BS' | 'USD' | 'USDT';
  totalDebitos: number;
  totalCreditos: number;
  saldo: number;
  estado: string;
};

export type ClienteLedgerResponse = {
  cliente: {
    id: string;
    nombre: string;
    documento: string | null;
    telefono: string | null;
    estado: string;
  };

  filtros: {
    desde: string | null;
    hasta: string | null;
    tipo: string | null;
    estado: string | null;
    tipoMov?: string | null;
    moneda: string | null;
    metodoCalculo?: 'TASA' | 'PORCENTAJE' | null;
  };

  resumen: {
    balancesFiltrados: BalanceClienteMoneda[];
    balancesGlobales: BalanceClienteMoneda[];

    totalUtilidadRealCop: number;

    utilidadPorDia?: {
      fecha: string;
      utilidadCop: number;
    }[];
  };

  movimientos: ClienteLedgerEntry[];
};

export type EstadoCarteraCliente =
  | 'ME_DEBE'
  | 'LE_DEBO';

  
  export type Moneda =
    | 'COP'
    | 'BS'
    | 'USD'
    | 'USDT';
    
export type CarteraResumenMoneda = {
  moneda: Moneda;
  totalPorCobrar: number;
  totalPorPagar: number;
  balanceNeto: number;
};

  export type CarteraBalanceCliente = {
  moneda: Moneda;
  totalDebitos: string;
  totalCreditos: string;
  saldo: string;
  estado:
    | 'ME_DEBE'
    | 'LE_DEBO'
    | 'SALDADO';
};

export type CarteraClienteItem = {
  cliente: {
    id: string;
    nombre: string;
    documento?: string | null;
    telefono?: string | null;
    estado: string;
  };

  balances: CarteraBalanceCliente[];
};

export type CarteraResponse = {
  resumenPorMoneda: CarteraResumenMoneda[];

  cantidadMeDeben: number;
  cantidadLesDebo: number;

  meDeben: CarteraClienteItem[];
  lesDebo: CarteraClienteItem[];
};