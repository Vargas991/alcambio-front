export type TipoOperacion = 'COMPRA' | 'VENTA' | 'OPERACION_DIRECTA';
export type EstadoOperacion = 'REGISTRADA' | 'CANCELADA';
export type Moneda = 'COP' | 'BS' | 'USD' | 'USDT';

export type ClienteResumen = {
  id: string;
  nombre: string;
  documento: string | null;
  telefono: string | null;
  estado?: string;
};



export type CuentaOperativa = {
  id: string;
  nombre: string;
  moneda: Moneda;
  categoria: 'BASE_COP' | 'OPERATIVA' | string;
  tipo: string;
  saldo: string;
  estado: string;
};

export type MovimientoCliente = {
  id: string;
  clienteId: string;
  tipo: string;
  operacionId: string | null;
  entradaId: string | null;
  salidaId: string | null;
  monedaTransaccion: Moneda | null;
  montoTransaccion: string | null;
  debitoCop: string;
  creditoCop: string;
  descripcion: string;
  creadoEn: string;
  cliente: ClienteResumen;
};

export type Operacion = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoOperacion;
  estado: EstadoOperacion;
  deudorId: string | null;
  acreedorId: string | null;
  monedaTransaccion: Moneda;
  montoTransaccion: string;
  tasaCompra: string;
  tasaVenta: string;
  totalCompraCop: string;
  totalVentaCop: string;
  utilidadCop: string;
  cuentaOperativaId: string | null;
  destinatario: string | null;
  fechaOperacion: string;
  notas: string | null;
  creadoEn: string;
  actualizadoEn: string;
  deudor: ClienteResumen | null;
  acreedor: ClienteResumen | null;
  cuentaOperativa: CuentaOperativa | null;
  movimientosCliente: MovimientoCliente[];
};

export type Cliente = {
  id: string;
  nombre: string;
  documento: string | null;
  telefono: string | null;
  estado: string;
};

export type Cuenta = {
  id: string;
  nombre: string;
  moneda: Moneda;
  categoria: 'BASE_COP' | 'OPERATIVA' | string;
  tipo: string;
  saldo: string;
  estado: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type OrigenOperacion =
  | {
      tipo: 'CUENTA';
      id: string;
      nombre: string;
      moneda: Moneda;
      saldo: string;
    }
  | {
      tipo: 'CLIENTE';
      id: string;
      nombre: string;
    };