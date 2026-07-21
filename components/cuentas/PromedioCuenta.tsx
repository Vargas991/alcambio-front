import { PromedioCompraCuenta } from '@/types/cuentas';

interface props {
  promedioCompra: PromedioCompraCuenta;
}

export default function PromedioCuenta ({ promedioCompra }: props)  {
    return (

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
    )
    
}
