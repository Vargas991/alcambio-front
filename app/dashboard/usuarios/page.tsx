import { UsuariosManager } from '@/components/usuarios/UsuariosManager';
import { getUsuariosServer } from '@/services/usuarios.server';


export default async function UsuariosPage() {
  const usuarios = await getUsuariosServer();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de usuarios
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Administra accesos, roles y estados de los usuarios.
        </p>
      </div>

      <UsuariosManager
        usuarios={usuarios}
      />
    </div>
  );
}