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
  codigo?: string;
  nombre?: string | null;

  tipo: string;
  estado: string;

  deudorId?: string | null;
  acreedorId?: string | null;
  cuentaOperativaId?: string | null;

  monedaTransaccion: string;
  montoTransaccion: string | number;

  tasaCompra: string | number | null;
  tasaVenta: string | number | null;

  totalCompraCop: string | number | null;
  totalVentaCop: string | number | null;
  utilidadCop: string | number | null;

  fechaOperacion?: string | null;
  destinatario?: string | null;
  notas?: string | null;

  creadoEn?: string;
  actualizadoEn?: string;

  deudor?: ClienteLedgerRelacion | null;
  acreedor?: ClienteLedgerRelacion | null;
  cuentaOperativa?: ClienteLedgerCuenta | null;
};

export type ClienteLedgerEntrada = {
  id: string;

  tipo: string;
  estado: string;

  deudorId?: string | null;
  acreedorId?: string | null;
  cuentaId?: string | null;

  montoCop: string | number;

  aplica4x1000?: boolean;
  impuesto4x1000Cop?: string | number;
  montoAplicadoDeudaCop?: string | number | null;

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

  montoCop?: string | number;
  montoBaseCop?: string | number;

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

  monedaTransaccion: string | null;
  montoTransaccion: number | string | null;

  debitoCop: number | string;
  creditoCop: number | string;

  saldoAcumuladoCop?: number | string;
  utilidadRealCop?: number | string;

  descripcion: string;
  creadoEn: string;

  operacion?: ClienteLedgerOperacion | null;
  entrada?: ClienteLedgerEntrada | null;
  salida?: ClienteLedgerSalida | null;
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
  };

  resumen: {
    totalDebitosCop: number;
    totalCreditosCop: number;
    saldoFiltradoCop: number;
    estado: 'ME_DEBE' | 'LE_DEBO' | 'SALDADO';

    totalDebitosGlobalCop: number;
    totalCreditosGlobalCop: number;
    saldoTotalCop: number;
    estadoTotal:
      | 'ME_DEBE'
      | 'LE_DEBO'
      | 'SALDADO';

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

export type CarteraClienteItem = {
  cliente: {
    id: string;
    nombre: string;
    documento: string | null;
    telefono: string | null;
    estado: string;
  };

  totalDebitosCop: number;
  totalCreditosCop: number;
  saldoCop: number;

  estadoCartera: EstadoCarteraCliente;
};

export type CarteraResponse = {
  resumen: {
    totalPorCobrarCop: number;
    totalPorPagarCop: number;
    balanceNetoCop: number;

    cantidadMeDeben: number;
    cantidadLesDebo: number;
  };

  meDeben: CarteraClienteItem[];
  lesDebo: CarteraClienteItem[];
};