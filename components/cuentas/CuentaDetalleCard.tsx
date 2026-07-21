import { formatMoney, formatNumber } from '@/lib/formatters';
import type { CuentaDetalle } from '@/services/cuentas.server';
import {PromedioCompraCuenta } from '@/types/cuentas';

type CuentaDetalleCardProps = {
  cuenta: CuentaDetalle;
  promedioCompra: PromedioCompraCuenta
};

function formatSaldo(cuenta: CuentaDetalle) {
  if (cuenta.moneda === 'COP') {
    return formatMoney(cuenta.saldo);
  }

  return `${formatNumber(cuenta.saldo)} ${cuenta.moneda}`;
}

export function CuentaDetalleCard({ cuenta, promedioCompra }: CuentaDetalleCardProps) {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      <div className="rounded-xl bg-white p-5 shadow-md md:col-span-2">
        <p className="text-sm text-gray-500">Cuenta</p>

        <h2 className="mt-1 text-lg font-bold text-gray-900">
          {cuenta.nombre}
        </h2>

        {cuenta.notas && (
          <p className="mt-2 text-sm text-gray-500">{cuenta.notas}</p>
        )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-sm text-gray-500">Saldo actual</p>

        <p className="mt-1 text-xl font-bold text-gray-900">
          {formatSaldo(cuenta)}
        </p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-sm text-gray-500">Estado</p>

        <p
          className={[
            'mt-1 text-lg font-bold',
            cuenta.estado === 'ACTIVO' ? 'text-green-700' : 'text-red-700',
          ].join(' ')}
        >
          {cuenta.estado === 'ACTIVO' ? 'Activa' : 'Inactiva'}
        </p>
      </div>

      {
        promedioCompra.aplica && 
      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-xs font-medium uppercase text-gray-500">
          Promedio de compra
        </p>

        <p className="mt-1 text-2xl font-bold text-gray-900">
          {promedioCompra.tasaMinimaVenta.toLocaleString('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Tasa mínima para vender sin perder.
        </p>
      </div>
      }

      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-sm text-gray-500">Categoría</p>

        <p className="mt-1 font-bold text-gray-900">{cuenta.categoria}</p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-sm text-gray-500">Tipo</p>

        <p className="mt-1 font-bold text-gray-900">{cuenta.tipo}</p>
      </div>

      {/* <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-sm text-gray-500">Moneda</p>

        <p className="mt-1 font-bold text-gray-900">{cuenta.moneda}</p>
      </div> */}

      <div className="rounded-xl bg-white p-5 shadow-md">
        <p className="text-sm text-gray-500">4x1000</p>

        <p
          className={[
            'mt-1 font-bold',
            cuenta.aplica4x1000 ? 'text-orange-700' : 'text-gray-900',
          ].join(' ')}
        >
          {cuenta.aplica4x1000 ? 'Aplica' : 'No aplica'}
        </p>
      </div>
    </section>
  );
}