'use client';

import Link from 'next/link';

import { formatDate } from '@/lib/formatters';

import type { ClienteLedgerEntry } from '@/types/clientes';
import type { Cliente, Cuenta } from '@/types/operaciones';
import type { PromedioCompraCuenta } from '@/types/cuentas';

import { MovimientoActions } from './MovimientosActions';

type ClienteMovimientosTableProps = {
  movimientos: ClienteLedgerEntry[];
  clientes: Cliente[];
  cuentas: Cuenta[];
  promedios?: PromedioCompraCuenta[];
  title?: string;
  description?: string;
};

type EntidadMovimiento = {
  tipo: 'CLIENTE' | 'CUENTA' | null;
  id: string | null;
  nombre: string;
};

type MovimientoNormalizado = {
  fecha: string;
  tipo: string;

  origen: EntidadMovimiento;
  destino: EntidadMovimiento;

  moneda: string;
  monto: number;

  tasaCompra: number | null;
  totalCompraCop: number | null;

  tasaVenta: number | null;
  totalVentaCop: number | null;

  utilidadCop: number | null;

  notas: string | null;

  editable: boolean;
  cancelado: boolean;
};

function formatNumber(value: number) {
  const [integerPart, decimalPart] = Math.abs(value)
    .toFixed(2)
    .split('.');

  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.',
  );

  const sign = value < 0 ? '-' : '';

  const decimals =
    decimalPart === '00'
      ? ''
      : `,${decimalPart.replace(/0+$/, '')}`;

  return `${sign}${formattedInteger}${decimals}`;
}

function formatCurrency(
  moneda: string,
  value: number,
) {
  return `${moneda} ${formatNumber(value)}`;
}

function getTipoLabel(tipo: string) {
  const labels: Record<string, string> = {
    COMPRA: 'Compra',
    VENTA: 'Venta',
    OPERACION_DIRECTA: 'Operación directa',

    ABONO: 'Abono',
    ABONO_DIRECTO: 'Abono directo',
    ABONO_CUENTA_PROPIA: 'Abono',
    ABONO_DIRECTO_PROVEEDOR: 'Abono directo',

    PAGO: 'Pago',
    PAGO_ACREEDOR: 'Pago acreedor',

    GASTO: 'Gasto',
    RETIRO: 'Retiro',

    AJUSTE: 'Ajuste',
    CANCELACION: 'Cancelación',
  };

  return labels[tipo] ?? tipo;
}

function entidadVacia(): EntidadMovimiento {
  return {
    tipo: null,
    id: null,
    nombre: '-',
  };
}

function getMovimientoData(
  movimiento: ClienteLedgerEntry,
): MovimientoNormalizado {
  /**
   * ========================================
   * OPERACIÓN
   * ========================================
   */
  if (movimiento.operacion) {
    const operacion = movimiento.operacion;

    let origen = entidadVacia();
    let destino = entidadVacia();

    /**
     * CUENTA -> CLIENTE
     */
    if (operacion.tipo === 'VENTA') {
      if (operacion.cuentaOperativa) {
        origen = {
          tipo: 'CUENTA',
          id: operacion.cuentaOperativa.id,
          nombre:
            operacion.cuentaOperativa.nombre,
        };
      }

      if (operacion.deudor) {
        destino = {
          tipo: 'CLIENTE',
          id: operacion.deudor.id,
          nombre:
            operacion.deudor.nombre,
        };
      } else if (operacion.destinatario) {
        destino = {
          tipo: null,
          id: null,
          nombre:
            operacion.destinatario,
        };
      }
    }

    /**
     * CLIENTE/PROVEEDOR -> CUENTA
     */
    if (operacion.tipo === 'COMPRA') {
      if (operacion.acreedor) {
        origen = {
          tipo: 'CLIENTE',
          id: operacion.acreedor.id,
          nombre:
            operacion.acreedor.nombre,
        };
      }

      if (operacion.cuentaOperativa) {
        destino = {
          tipo: 'CUENTA',
          id: operacion.cuentaOperativa.id,
          nombre:
            operacion.cuentaOperativa.nombre,
        };
      }
    }

    /**
     * CLIENTE -> CLIENTE
     */
    if (
      operacion.tipo ===
      'OPERACION_DIRECTA'
    ) {
      if (operacion.acreedor) {
        origen = {
          tipo: 'CLIENTE',
          id: operacion.acreedor.id,
          nombre:
            operacion.acreedor.nombre,
        };
      }

      if (operacion.deudor) {
        destino = {
          tipo: 'CLIENTE',
          id: operacion.deudor.id,
          nombre:
            operacion.deudor.nombre,
        };
      } else if (operacion.destinatario) {
        destino = {
          tipo: null,
          id: null,
          nombre:
            operacion.destinatario,
        };
      }
    }

    const cancelado =
      operacion.estado === 'CANCELADA';

    return {
      fecha:
        operacion.fechaOperacion ??
        movimiento.creadoEn,

      tipo: operacion.tipo,

      origen,
      destino,

      moneda:
        operacion.monedaTransaccion,

      monto: Number(
        operacion.montoTransaccion,
      ),

      tasaCompra: Number(
        operacion.tasaCompra,
      ),

      totalCompraCop: Number(
        operacion.totalCompraCop,
      ),

      tasaVenta:
        operacion.tipo === 'COMPRA'
          ? null
          : Number(operacion.tasaVenta),

      totalVentaCop:
        operacion.tipo === 'COMPRA'
          ? null
          : Number(
              operacion.totalVentaCop,
            ),

      utilidadCop:
        operacion.tipo === 'COMPRA'
          ? null
          : Number(
              operacion.utilidadCop,
            ),

      notas:
        operacion.notas ?? "-",

      editable:
        !cancelado &&
        movimiento.tipo !==
          'CANCELACION',

      cancelado:
        cancelado ||
        movimiento.tipo ===
          'CANCELACION',
    };
  }

  /**
   * ========================================
   * ENTRADA
   * ========================================
   */
  if (movimiento.entrada) {
    const entrada = movimiento.entrada;

    const esAbonoCuenta =
      entrada.tipo ===
      'ABONO_CUENTA_PROPIA';

    const origen: EntidadMovimiento =
      entrada.deudor
        ? {
            tipo: 'CLIENTE',
            id: entrada.deudor.id,
            nombre:
              entrada.deudor.nombre,
          }
        : entidadVacia();

    let destino =
      entidadVacia();

    if (
      esAbonoCuenta &&
      entrada.cuenta
    ) {
      destino = {
        tipo: 'CUENTA',
        id: entrada.cuenta.id,
        nombre:
          entrada.cuenta.nombre,
      };
    }

    if (
      !esAbonoCuenta &&
      entrada.acreedor
    ) {
      destino = {
        tipo: 'CLIENTE',
        id: entrada.acreedor.id,
        nombre:
          entrada.acreedor.nombre,
      };
    }

    /**
     * Monto que REALMENTE afectó
     * el saldo del cliente.
     *
     * Ejemplo:
     *
     * abona 100.000
     * 4x1000 = 400
     * movimiento crédito = 99.600
     *
     * mostramos COP 99.600
     */
    const debitoCop = Number(
      movimiento.debitoCop ?? 0,
    );

    const creditoCop = Number(
      movimiento.creditoCop ?? 0,
    );

    const montoAplicado =
      creditoCop > 0
        ? creditoCop
        : debitoCop > 0
          ? debitoCop
          : Number(
              entrada.montoCop ?? 0,
            );

    const cancelado =
      entrada.estado === 'CANCELADA';

    return {
      fecha:
        entrada.creadoEn ??
        movimiento.creadoEn,

      tipo: entrada.tipo,

      origen,
      destino,

      moneda: 'COP',

      monto: montoAplicado,

      tasaCompra: null,
      totalCompraCop: null,

      tasaVenta: null,
      totalVentaCop: null,

      utilidadCop: null,

      notas:
        entrada.notas ??
        entrada.descripcion ??
        movimiento.descripcion ??
        null,

      editable:
        !cancelado &&
        movimiento.tipo !==
          'CANCELACION',

      cancelado:
        cancelado ||
        movimiento.tipo ===
          'CANCELACION',
    };
  }

  /**
   * ========================================
   * SALIDA
   * ========================================
   */
  if (movimiento.salida) {
    const salida = movimiento.salida;

    const origen: EntidadMovimiento =
      salida.cuenta
        ? {
            tipo: 'CUENTA',
            id: salida.cuenta.id,
            nombre:
              salida.cuenta.nombre,
          }
        : entidadVacia();

    const destino: EntidadMovimiento =
      salida.acreedor
        ? {
            tipo: 'CLIENTE',
            id: salida.acreedor.id,
            nombre:
              salida.acreedor.nombre,
          }
        : entidadVacia();

    /**
     * Para el perfil mostramos
     * cuánto afectó realmente al
     * cliente, no necesariamente
     * cuánto salió de la cuenta.
     */
    const debitoCop = Number(
      movimiento.debitoCop ?? 0,
    );

    const creditoCop = Number(
      movimiento.creditoCop ?? 0,
    );

    const montoAplicado =
      debitoCop > 0
        ? debitoCop
        : creditoCop > 0
          ? creditoCop
          : Number(
              salida.montoBaseCop ??
                salida.montoCop ??
                0,
            );

    const cancelado =
      salida.estado === 'CANCELADA';

    return {
      fecha:
        salida.creadoEn ??
        movimiento.creadoEn,

      tipo: salida.tipo,

      origen,
      destino,

      moneda: 'COP',

      monto: montoAplicado,

      tasaCompra: null,
      totalCompraCop: null,

      tasaVenta: null,
      totalVentaCop: null,

      utilidadCop: null,

      notas:
        salida.notas ??
        salida.descripcion ??
        movimiento.descripcion ??
        null,

      editable:
        !cancelado &&
        movimiento.tipo !==
          'CANCELACION',

      cancelado:
        cancelado ||
        movimiento.tipo ===
          'CANCELACION',
    };
  }

  /**
   * ========================================
   * AJUSTE / OTROS
   * ========================================
   */

  const debitoCop = Number(
    movimiento.debitoCop ?? 0,
  );

  const creditoCop = Number(
    movimiento.creditoCop ?? 0,
  );

  let montoMovimientoCop =
    Number(
      movimiento.montoTransaccion ??
        0,
    );

  /**
   * Débito:
   * aumenta deuda del cliente.
   *
   * Crédito:
   * disminuye deuda del cliente.
   */
  if (
    movimiento.tipo === 'AJUSTE'
  ) {
    if (debitoCop > 0) {
      montoMovimientoCop =
        debitoCop;
    } else if (creditoCop > 0) {
      montoMovimientoCop =
        -creditoCop;
    }
  } else if (debitoCop > 0) {
    montoMovimientoCop =
      debitoCop;
  } else if (creditoCop > 0) {
    montoMovimientoCop =
      creditoCop;
  }

  return {
    fecha: movimiento.creadoEn,

    tipo: movimiento.tipo,

    origen: entidadVacia(),
    destino: entidadVacia(),

    moneda: 'COP',

    monto: montoMovimientoCop,

    tasaCompra: null,
    totalCompraCop: null,

    tasaVenta: null,
    totalVentaCop: null,

    utilidadCop: null,

    notas:
      movimiento.descripcion ??
      null,

    editable: false,

    cancelado:
      movimiento.tipo ===
      'CANCELACION',
  };
}

function TipoBadge({
  tipo,
  cancelado,
}: {
  tipo: string;
  cancelado: boolean;
}) {
  let className =
    'bg-gray-50 text-gray-700 ring-gray-600/20';

  if (tipo === 'COMPRA') {
    className =
      'bg-green-50 text-green-700 ring-green-600/20';
  }

  if (tipo === 'VENTA') {
    className =
      'bg-blue-50 text-blue-700 ring-blue-600/20';
  }

  if (
    tipo ===
    'OPERACION_DIRECTA'
  ) {
    className =
      'bg-purple-50 text-purple-700 ring-purple-600/20';
  }

  if (
    tipo ===
      'ABONO_CUENTA_PROPIA' ||
    tipo === 'ABONO'
  ) {
    className =
      'bg-cyan-50 text-cyan-700 ring-cyan-600/20';
  }

  if (
    tipo ===
      'ABONO_DIRECTO_PROVEEDOR' ||
    tipo === 'ABONO_DIRECTO'
  ) {
    className =
      'bg-teal-50 text-teal-700 ring-teal-600/20';
  }

  if (
    tipo === 'PAGO_ACREEDOR' ||
    tipo === 'PAGO'
  ) {
    className =
      'bg-orange-50 text-orange-700 ring-orange-600/20';
  }

  if (tipo === 'AJUSTE') {
    className =
      'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
  }

  if (
    tipo === 'CANCELACION'
  ) {
    className =
      'bg-red-50 text-red-700 ring-red-600/20';
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <span
        className={[
          'inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
          cancelado
            ? 'bg-gray-50 text-gray-500 ring-gray-300'
            : className,
        ].join(' ')}
      >
        {getTipoLabel(tipo)}
      </span>

      {cancelado && (
        <span className="text-[10px] font-bold uppercase tracking-wide text-red-500">
          Cancelado
        </span>
      )}
    </div>
  );
}

/**
 * Celda reutilizable para cliente/cuenta.
 */
function EntidadCell({
  entidad,
}: {
  entidad: EntidadMovimiento;
}) {
  if (
    !entidad.id ||
    !entidad.tipo
  ) {
    return (
      <span className="text-sm font-medium text-gray-500">
        {entidad.nombre}
      </span>
    );
  }

  /**
   * CLIENTE
   */
  if (entidad.tipo === 'CLIENTE') {
    return (
      <Link
        href={`/clientes/${entidad.id}`}
        className="text-sm font-medium text-gray-700 transition hover:text-blue-600 hover:underline"
      >
        {entidad.nombre}
      </Link>
    );
  }

  /**
   * CUENTA
   */
  return (
    <Link
      href={`/cuentas/${entidad.id}`}
      className="text-sm font-medium text-gray-700 transition hover:text-blue-600 hover:underline"
    >
      {entidad.nombre}
    </Link>
  );
}

export function ClienteMovimientosTable({
  movimientos,
  clientes,
  cuentas,
  promedios = [],
  title = 'Movimientos del cliente',
  description = 'Operaciones, entradas, salidas, pagos, abonos y ajustes asociados al cliente.',
}: ClienteMovimientosTableProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="border-b border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900">
          {title}
        </h2>

        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1550px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Fecha
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Tipo
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Origen
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Destino
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Monto
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                TC
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Total compra
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                TV
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Total venta
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Utilidad
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Notas
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No hay movimientos registrados.
                </td>
              </tr>
            ) : (
              movimientos.map(
                (movimiento) => {
                  const item =
                    getMovimientoData(
                      movimiento,
                    );

                  return (
                    <tr
                      key={movimiento.id}
                      className={[
                        'border-b border-gray-100 transition hover:bg-gray-50',

                        item.cancelado
                          ? 'bg-gray-50/50 opacity-75'
                          : '',
                      ].join(' ')}
                    >
                      {/* FECHA */}
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                        {formatDate(
                          item.fecha,
                        )}
                      </td>

                      {/* TIPO */}
                      <td className="px-4 py-4">
                        <TipoBadge
                          tipo={item.tipo}
                          cancelado={
                            item.cancelado
                          }
                        />
                      </td>

                      {/* ORIGEN */}
                      <td className="px-4 py-4">
                        <EntidadCell
                          entidad={
                            item.origen
                          }
                        />
                      </td>

                      {/* DESTINO */}
                      <td className="px-4 py-4">
                        <EntidadCell
                          entidad={
                            item.destino
                          }
                        />
                      </td>

                      {/* MONTO */}
                      <td
                        className={[
                          'whitespace-nowrap px-4 py-4 text-right text-sm font-semibold',

                          item.tipo ===
                              'AJUSTE' &&
                            item.monto < 0
                            ? 'text-green-700'
                            : item.tipo ===
                                  'AJUSTE' &&
                                item.monto >
                                  0
                              ? 'text-red-700'
                              : 'text-gray-900',
                        ].join(' ')}
                      >
                        {formatCurrency(
                          item.moneda,
                          item.monto,
                        )}
                      </td>

                      {/* TC */}
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-700">
                        {item.tasaCompra !==
                        null
                          ? formatNumber(
                              item.tasaCompra,
                            )
                          : '-'}
                      </td>

                      {/* TOTAL COMPRA */}
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-gray-700">
                        {item.totalCompraCop !==
                        null
                          ? formatCurrency(
                              'COP',
                              item.totalCompraCop,
                            )
                          : '-'}
                      </td>

                      {/* TV */}
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm text-gray-700">
                        {item.tasaVenta !== null
                          ? formatNumber(
                              item.tasaVenta,
                            )
                          : '-'}
                      </td>

                      {/* TOTAL VENTA */}
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-gray-700">
                        {item.totalVentaCop !==
                        null
                          ? formatCurrency(
                              'COP',
                              item.totalVentaCop,
                            )
                          : '-'}
                      </td>

                      {/* UTILIDAD */}
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-green-700">
                        {item.utilidadCop !== null
                          ? formatCurrency(
                              'COP',
                              item.utilidadCop,
                            )
                          : '-'}
                      </td>

                      {/* NOTAS */}
                      <td className="max-w-[260px] px-4 py-4 text-sm text-gray-500">
                        {item.notas ? (
                          <span
                            title={item.notas}
                            className="block max-w-[260px] truncate"
                          >
                            {item.notas}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td className="px-4 py-4">
                        <MovimientoActions
                          movimiento={
                            movimiento
                          }
                          clientes={
                            clientes
                          }
                          cuentas={
                            cuentas
                          }
                          promedios={
                            promedios
                          }
                        />
                      </td>
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}