'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  FiEdit3,
  FiKey,
  FiPlus,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';

import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

import type {
  Usuario,
  RolUsuario,
} from '@/types/usuarios';

type UsuariosTableProps = {
  usuarios: Usuario[];
  onCreate: () => void;
  onEdit: (usuario: Usuario) => void;
  onPassword: (usuario: Usuario) => void;
};

function getRolLabel(
  rol: RolUsuario,
) {
  const labels: Record<
    RolUsuario,
    string
  > = {
    ADMIN: 'Administrador',
    OPERADOR: 'Operador',
    VISOR: 'Visor',
  };

  return labels[rol];
}

export function UsuariosTable({
  usuarios,
  onCreate,
  onEdit,
  onPassword,
}: UsuariosTableProps) {
  const router = useRouter();

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  async function handleEstado(
    usuario: Usuario,
  ) {
    const nuevoEstado =
      usuario.estado === 'ACTIVO'
        ? 'INACTIVO'
        : 'ACTIVO';

    const confirmed = window.confirm(
      usuario.estado === 'ACTIVO'
        ? `¿Desactivar a ${usuario.nombre}?`
        : `¿Activar a ${usuario.nombre}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingId(usuario.id);

      await api.patch(
        `/usuarios/${usuario.id}/estado`,
        {
          estado: nuevoEstado,
        },
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        'No fue posible actualizar el estado del usuario.',
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-md">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Usuarios
          </h2>

          <p className="text-sm text-gray-500">
            Gestiona los usuarios que tienen acceso al sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Usuario
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Correo
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Rol
              </th>

              <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-400">
                Estado
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-400">
                Creado
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map(
                (usuario) => {
                  const loading =
                    loadingId ===
                    usuario.id;

                  return (
                    <tr
                      key={usuario.id}
                      className="border-b border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {usuario.nombre}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {usuario.correo}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          {getRolLabel(
                            usuario.rol,
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={[
                            'rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset',
                            usuario.estado ===
                            'ACTIVO'
                              ? 'bg-green-50 text-green-700 ring-green-600/20'
                              : 'bg-red-50 text-red-700 ring-red-600/20',
                          ].join(' ')}
                        >
                          {usuario.estado ===
                          'ACTIVO'
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(
                          usuario.creadoEn,
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onEdit(usuario)
                            }
                            disabled={
                              loading
                            }
                            title="Editar usuario"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onPassword(
                                usuario,
                              )
                            }
                            disabled={
                              loading
                            }
                            title="Cambiar contraseña"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50"
                          >
                            <FiKey className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleEstado(
                                usuario,
                              )
                            }
                            disabled={
                              loading
                            }
                            title={
                              usuario.estado ===
                              'ACTIVO'
                                ? 'Desactivar'
                                : 'Activar'
                            }
                            className={[
                              'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:opacity-50',
                              usuario.estado ===
                              'ACTIVO'
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50',
                            ].join(' ')}
                          >
                            {usuario.estado ===
                            'ACTIVO' ? (
                              <FiToggleRight className="h-5 w-5" />
                            ) : (
                              <FiToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                        </div>
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