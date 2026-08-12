import type {
  CarteraResponse,
  Moneda,
} from '@/types/clientes';

import { CarteraSectionTable } from './CarteraSectionTable';

type CarteraTableProps = {
  cartera: CarteraResponse;
  moneda: Moneda;
};

export function CarteraTable({
  cartera,
  moneda,
}: CarteraTableProps) {
  return (
    <div className="space-y-6">
      <CarteraSectionTable
        title="Clientes / proveedores que me deben"
        description="Cuentas por cobrar registradas en cartera."
        items={cartera.meDeben}
        type="ME_DEBEN"
        moneda={moneda}
      />

      <CarteraSectionTable
        title="Clientes / proveedores a los que les debo"
        description="Cuentas por pagar registradas en cartera."
        items={cartera.lesDebo}
        type="LES_DEBO"
        moneda={moneda}
      />
    </div>
  );
}