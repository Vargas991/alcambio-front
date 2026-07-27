'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { api } from '@/lib/api';

import type {
  RolUsuario,
  Usuario,
} from '@/types/usuarios';

type UsuarioFormModalProps = {
  open: boolean;
  usuario?: Usuario | null;
  onClose: () => void;
};

export function UsuarioFormModal({
  open,
  usuario,
  onClose,
}: UsuarioFormModalProps) {
  const router = useRouter();

  const isEditing =
    Boolean(usuario);

  const [nombre, setNombre] =
    useState('');

  const [correo, setCorreo] =
    useState('');

  const [rol, setRol] =
    useState<RolUsuario>(
      'OPERADOR',
    );

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (usuario) {
      setNombre(
        usuario.nombre,
      );

      setCorreo(
        usuario.correo,
      );

      setRol(
        usuario.rol,
      );

      setPassword('');
      setConfirmPassword('');

      return;
    }

    setNombre('');
    setCorreo('');
    setRol('OPERADOR');
    setPassword('');
    setConfirmPassword('');
  }, [open, usuario]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    if (!nombre.trim()) {
      alert(
        'Debes indicar el nombre.',
      );
      return;
    }

    if (!correo.trim()) {
      alert(
        'Debes indicar el correo.',
      );
      return;
    }

    if (!isEditing) {
      if (
        password.length < 6
      ) {
        alert(
          'La contraseña debe tener al menos 6 caracteres.',
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        alert(
          'Las contraseñas no coinciden.',
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      if (usuario) {
        await api.patch(
          `/usuarios/${usuario.id}`,
          {
            nombre:
              nombre.trim(),

            correo:
              correo.trim(),

            rol,
          },
        );
      } else {
        await api.post(
          '/usuarios',
          {
            nombre:
              nombre.trim(),

            correo:
              correo.trim(),

            password,

            rol,
          },
        );
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);

      alert(
        isEditing
          ? 'No fue posible actualizar el usuario.'
          : 'No fue posible registrar el usuario.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing
              ? 'Editar usuario'
              : 'Nuevo usuario'}
          </h2>

          <p className="text-sm text-gray-500">
            {isEditing
              ? 'Modifica la información y rol del usuario.'
              : 'Crea un nuevo usuario con acceso al sistema.'}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Nombre
            </span>

            <input
              type="text"
              value={nombre}
              onChange={(event) =>
                setNombre(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Nombre completo"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Correo
            </span>

            <input
              type="email"
              value={correo}
              onChange={(event) =>
                setCorreo(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="usuario@email.com"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Rol
            </span>

            <select
              value={rol}
              onChange={(event) =>
                setRol(
                  event.target
                    .value as RolUsuario,
                )
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="ADMIN">
                Administrador
              </option>

              <option value="OPERADOR">
                Operador
              </option>

              <option value="VISOR">
                Visor
              </option>
            </select>
          </label>

          {!isEditing && (
            <>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Contraseña
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Confirmar contraseña
                </span>

                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={
              submitting
            }
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              submitting
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? 'Guardando...'
              : isEditing
                ? 'Guardar cambios'
                : 'Crear usuario'}
          </button>
        </div>
      </section>
    </div>
  );
}