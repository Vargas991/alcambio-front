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

  operacion?: {
    id?: string;
    codigo?: string;
    tipo?: string | null;
    estado?: string;
    tasaCompra?: number | string | null;
    tasaVenta?: number | string | null;
    totalCompraCop?: number | string | null;
    totalVentaCop?: number | string | null;
    utilidadCop?: number | string | null;
    notas?: string | null;
  } | null;

  entrada?: {
    id: string;
    tipo: string;
    estado: string;
    montoCop?: number | string;
    descripcion?: string | null;
  } | null;

  salida?: {
    id: string;
    tipo: string;
    estado: string;
    montoCop?: number | string;
    montoBaseCop?: number | string;
    montoEnviadoCop?: number | string;
    totalDebitadoCop?: number | string;
    impuestoProveedor4x1000Cop?: number | string;
    impuestoCuenta4x1000Cop?: number | string;
    descripcion?: string | null;
  } | null;

  [key: string]: unknown;
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
    estadoTotal: 'ME_DEBE' | 'LE_DEBO' | 'SALDADO';

    totalUtilidadRealCop: number;
    utilidadPorDia?: {
      fecha: string;
      utilidadCop: number;
    }[];
  };
  movimientos: ClienteLedgerEntry[];
};

export type EstadoCarteraCliente = 'ME_DEBE' | 'LE_DEBO';

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