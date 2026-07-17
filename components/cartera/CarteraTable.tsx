import type { CarteraResponse } from '@/types/clientes';
import { CarteraSectionTable } from './CarteraSectionTable';

type CarteraTableProps = {
  cartera: CarteraResponse;
};

export function CarteraTable({ cartera }: CarteraTableProps) {
  return (
    <div className="space-y-6">
      <CarteraSectionTable
        title="Clientes que me deben"
        description="Cuentas por cobrar registradas en cartera."
        items={cartera.meDeben}
        type="ME_DEBEN"
      />

      <CarteraSectionTable
        title="Clientes / proveedores a los que les debo"
        description="Cuentas por pagar registradas en cartera."
        items={cartera.lesDebo}
        type="LES_DEBO"
      />
    </div>
  );
}