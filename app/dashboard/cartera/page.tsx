import { CarteraContent } from '@/components/cartera/CarteraContent';
import { getCarteraServer } from '@/services/clientes.server';

export default async function CarteraPage() {
  const cartera =
    await getCarteraServer();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">
          Cartera
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Consulta saldos pendientes por cobrar y por pagar.
        </p>
      </section>

      <CarteraContent
        cartera={cartera}
      />
    </div>
  );
}