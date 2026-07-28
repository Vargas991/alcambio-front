import {
  OrganizacionForm,
} from '@/components/configuracion/OrganizacionForm';

import {
  getConfiguracionOrganizacionServer,
} from '@/services/configuracion.server';

export default async function OrganizacionPage() {
  const configuracion =
    await getConfiguracionOrganizacionServer();

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Configuración de la organización
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Actualiza el nombre, logo y datos generales de la organización.
        </p>
      </header>

      <OrganizacionForm
        configuracion={
          configuracion
        }
      />
    </main>
  );
}