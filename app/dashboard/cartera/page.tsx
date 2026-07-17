import { CarteraSummary } from '@/components/cartera/CarteraSummary';
import { CarteraTable } from '@/components/cartera/CarteraTable';
import { getCarteraServer } from '@/services/clientes.server';

export default async function CarteraPage() {
  const cartera = await getCarteraServer();

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-md">
        <h1 className="text-xl font-bold text-gray-900">Cartera</h1>

        <p className="mt-1 text-sm text-gray-500">
          Consulta saldos pendientes por cobrar y por pagar.
        </p>
      </section>

      <CarteraSummary cartera={cartera} />

      <CarteraTable cartera={cartera} />
    </div>
  );
}