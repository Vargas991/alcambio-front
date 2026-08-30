'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {
  FiArrowLeft,
  FiEdit2,
  FiLogIn,
  FiPlus,
  FiSave,
  FiToggleLeft,
  FiToggleRight,
} from 'react-icons/fi';

import { logout } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate, formatMoney } from '@/lib/formatters';
import type {
  ConfiguracionOrganizacion,
  ActualizarConfiguracionOrganizacionInput,
} from '@/types/configuracion';
import type { PagoTenant, Tenant } from '@/types/tenants';
import type { RolUsuario, Usuario } from '@/types/usuarios';

type TenantDetailManagerProps = {
  tenant: Tenant;
  configuracion: ConfiguracionOrganizacion;
  usuarios: Usuario[];
  pagos: PagoTenant[];
};

type UsuarioForm = {
  id?: string;
  nombre: string;
  correo: string;
  password: string;
  rol: Exclude<RolUsuario, 'SUPER_ADMIN'>;
  activo: boolean;
};

type PagoForm = {
  monto: string;
  moneda: PagoTenant['moneda'];
  fechaPago: string;
  fechaRenovacion: string;
  referencia: string;
  notas: string;
};

const emptyUserForm: UsuarioForm = {
  nombre: '',
  correo: '',
  password: '',
  rol: 'ADMIN',
  activo: true,
};

const emptyPagoForm: PagoForm = {
  monto: '',
  moneda: 'COP',
  fechaPago: toDateInputValue(new Date().toISOString()),
  fechaRenovacion: '',
  referencia: '',
  notas: '',
};

const rolLabels: Record<Exclude<RolUsuario, 'SUPER_ADMIN'>, string> = {
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
  VISOR: 'Visor',
};

export function TenantDetailManager({
  tenant,
  configuracion,
  usuarios,
  pagos,
}: TenantDetailManagerProps) {
  const router = useRouter();
  const [configForm, setConfigForm] =
    useState<ActualizarConfiguracionOrganizacionInput>({
      nombre: configuracion.nombre,
      telefono: configuracion.telefono,
      correo: configuracion.correo,
      direccion: configuracion.direccion,
      monedaBase: configuracion.monedaBase,
      zonaHoraria: configuracion.zonaHoraria,
    });
  const [userForm, setUserForm] = useState<UsuarioForm>(emptyUserForm);
  const [pagoForm, setPagoForm] = useState<PagoForm>({
    ...emptyPagoForm,
    fechaRenovacion: tenant.fechaRenovacion
      ? toDateInputValue(tenant.fechaRenovacion)
      : '',
  });
  const [configSubmitting, setConfigSubmitting] = useState(false);
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [pagoSubmitting, setPagoSubmitting] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const editingUser = Boolean(userForm.id);

  async function handleConfigSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfigSubmitting(true);

    try {
      await api.patch(
        `/super-admin/tenants/${tenant.id}/configuracion`,
        configForm,
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('No fue posible guardar la configuracion.');
    } finally {
      setConfigSubmitting(false);
    }
  }

  async function handleUserSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUserSubmitting(true);

    try {
      const payload = {
        nombre: userForm.nombre.trim(),
        correo: userForm.correo.trim(),
        rol: userForm.rol,
        activo: userForm.activo,
        ...(editingUser ? {} : { password: userForm.password }),
      };

      if (userForm.id) {
        await api.patch(
          `/super-admin/tenants/${tenant.id}/usuarios/${userForm.id}`,
          payload,
        );
      } else {
        await api.post(`/super-admin/tenants/${tenant.id}/usuarios`, payload);
      }

      setUserForm(emptyUserForm);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('No fue posible guardar el usuario.');
    } finally {
      setUserSubmitting(false);
    }
  }

  async function handlePagoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPagoSubmitting(true);

    try {
      await api.post(`/super-admin/tenants/${tenant.id}/pagos`, {
        monto: Number(pagoForm.monto),
        moneda: pagoForm.moneda,
        fechaPago: pagoForm.fechaPago || undefined,
        fechaRenovacion: pagoForm.fechaRenovacion || undefined,
        referencia: pagoForm.referencia.trim() || undefined,
        notas: pagoForm.notas.trim() || undefined,
      });

      setPagoForm({
        ...emptyPagoForm,
        fechaRenovacion: pagoForm.fechaRenovacion,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('No fue posible registrar el pago.');
    } finally {
      setPagoSubmitting(false);
    }
  }

  function handleEditUser(usuario: Usuario) {
    setUserForm({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol: usuario.rol === 'SUPER_ADMIN' ? 'VISOR' : usuario.rol,
      activo: usuario.estado === 'ACTIVO',
    });
  }

  async function handleToggleUser(usuario: Usuario) {
    const activo = usuario.estado !== 'ACTIVO';

    try {
      setLoadingUserId(usuario.id);
      await api.patch(`/super-admin/tenants/${tenant.id}/usuarios/${usuario.id}`, {
        activo,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('No fue posible cambiar el estado del usuario.');
    } finally {
      setLoadingUserId(null);
    }
  }

  function handleEnterDashboard() {
    if (!tenant.activo) {
      return;
    }

    const confirmed = window.confirm(
      `Se cerrara la sesion de Super Admin y seras enviado al login de ${tenant.slug}.`,
    );

    if (!confirmed) {
      return;
    }

    void logout(`/login?tenant=${encodeURIComponent(tenant.slug)}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/super-admin/tenants"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="h-4 w-4" />
          Volver a tenants
        </Link>

        <button
          type="button"
          onClick={handleEnterDashboard}
          disabled={!tenant.activo}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiLogIn className="h-4 w-4" />
          Entrar al dashboard
        </button>
      </div>

      <header>
        <h1 className="text-2xl font-bold text-gray-900">{tenant.nombre}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Slug {tenant.slug} - {tenant.activo ? 'Activo' : 'Inactivo'}
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">
          Informacion del tenant
        </h2>
        <dl className="mt-4 grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="font-semibold text-gray-500">ID</dt>
            <dd className="mt-1 break-all text-gray-900">{tenant.id}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Slug</dt>
            <dd className="mt-1 text-gray-900">{tenant.slug}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Usuarios</dt>
            <dd className="mt-1 text-gray-900">{usuarios.length}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Fecha activacion</dt>
            <dd className="mt-1 text-gray-900">
              {formatOptionalDate(tenant.fechaActivacion)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Fecha renovacion</dt>
            <dd className="mt-1 text-gray-900">
              {formatOptionalDate(tenant.fechaRenovacion)}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-500">Periodo</dt>
            <dd className="mt-1 text-gray-900">
              {tenant.periodoRenovacion === 'ANUAL' ? 'Anual' : 'Mensual'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-900">Pagos manuales</h2>
            <p className="mt-1 text-sm text-gray-500">
              Historial comercial del tenant.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Fecha pago</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Referencia</th>
                  <th className="px-4 py-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagos.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      No hay pagos registrados.
                    </td>
                  </tr>
                ) : (
                  pagos.map((pago) => (
                    <tr key={pago.id}>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(pago.fechaPago)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {pago.moneda === 'COP'
                          ? formatMoney(pago.monto)
                          : `${pago.monto} ${pago.moneda}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {pago.referencia ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {pago.notas ?? '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handlePagoSubmit}
          className="h-fit rounded-lg border border-gray-200 bg-white p-5"
        >
          <h2 className="text-lg font-bold text-gray-900">Registrar pago</h2>

          <div className="mt-5 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Monto
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={pagoForm.monto}
                onChange={(event) =>
                  setPagoForm((current) => ({
                    ...current,
                    monto: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Moneda
              </span>
              <select
                value={pagoForm.moneda}
                onChange={(event) =>
                  setPagoForm((current) => ({
                    ...current,
                    moneda: event.target.value as PagoForm['moneda'],
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              >
                <option value="COP">COP</option>
                <option value="BS">BS</option>
                <option value="USD">USD</option>
                <option value="USDT">USDT</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Fecha pago
              </span>
              <input
                type="date"
                value={pagoForm.fechaPago}
                onChange={(event) =>
                  setPagoForm((current) => ({
                    ...current,
                    fechaPago: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Nueva renovacion
              </span>
              <input
                type="date"
                value={pagoForm.fechaRenovacion}
                onChange={(event) =>
                  setPagoForm((current) => ({
                    ...current,
                    fechaRenovacion: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Referencia
              </span>
              <input
                value={pagoForm.referencia}
                onChange={(event) =>
                  setPagoForm((current) => ({
                    ...current,
                    referencia: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Notas
              </span>
              <textarea
                value={pagoForm.notas}
                onChange={(event) =>
                  setPagoForm((current) => ({
                    ...current,
                    notas: event.target.value,
                  }))
                }
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={pagoSubmitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            <FiSave className="h-4 w-4" />
            {pagoSubmitting ? 'Guardando...' : 'Registrar pago'}
          </button>
        </form>
      </section>

      <form
        onSubmit={handleConfigSubmit}
        className="rounded-lg border border-gray-200 bg-white p-5"
      >
        <h2 className="text-lg font-bold text-gray-900">
          Configuracion de organizacion
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Nombre visible
            </span>
            <input
              value={configForm.nombre}
              onChange={(event) =>
                setConfigForm((current) => ({
                  ...current,
                  nombre: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Correo
            </span>
            <input
              type="email"
              value={configForm.correo ?? ''}
              onChange={(event) =>
                setConfigForm((current) => ({
                  ...current,
                  correo: event.target.value || null,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Telefono
            </span>
            <input
              value={configForm.telefono ?? ''}
              onChange={(event) =>
                setConfigForm((current) => ({
                  ...current,
                  telefono: event.target.value || null,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Zona horaria
            </span>
            <input
              value={configForm.zonaHoraria}
              onChange={(event) =>
                setConfigForm((current) => ({
                  ...current,
                  zonaHoraria: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              required
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Moneda base
            </span>
            <select
              value={configForm.monedaBase}
              onChange={(event) =>
                setConfigForm((current) => ({
                  ...current,
                  monedaBase: event.target.value as typeof configForm.monedaBase,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            >
              <option value="COP">COP</option>
              <option value="BS">BS</option>
              <option value="USD">USD</option>
              <option value="USDT">USDT</option>
            </select>
          </label>

          <label className="block space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase text-gray-500">
              Direccion
            </span>
            <input
              value={configForm.direccion ?? ''}
              onChange={(event) =>
                setConfigForm((current) => ({
                  ...current,
                  direccion: event.target.value || null,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={configSubmitting}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
        >
          <FiSave className="h-4 w-4" />
          {configSubmitting ? 'Guardando...' : 'Guardar configuracion'}
        </button>
      </form>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Usuarios</h2>
              <p className="mt-1 text-sm text-gray-500">
                Accesos operativos asociados a este tenant.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUserForm(emptyUserForm)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FiPlus className="h-4 w-4" />
              Nuevo usuario
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      No hay usuarios registrados para este tenant.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {usuario.nombre}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {usuario.correo}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {usuario.rol === 'SUPER_ADMIN'
                          ? 'Super admin'
                          : rolLabels[usuario.rol]}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'rounded-full px-2 py-1 text-xs font-semibold',
                            usuario.estado === 'ACTIVO'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-600',
                          ].join(' ')}
                        >
                          {usuario.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar usuario"
                            onClick={() => handleEditUser(usuario)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title={
                              usuario.estado === 'ACTIVO'
                                ? 'Desactivar usuario'
                                : 'Activar usuario'
                            }
                            disabled={loadingUserId === usuario.id}
                            onClick={() => handleToggleUser(usuario)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            {usuario.estado === 'ACTIVO' ? (
                              <FiToggleRight className="h-5 w-5" />
                            ) : (
                              <FiToggleLeft className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={handleUserSubmit}
          className="h-fit rounded-lg border border-gray-200 bg-white p-5"
        >
          <h2 className="text-lg font-bold text-gray-900">
            {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>

          <div className="mt-5 space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Nombre
              </span>
              <input
                value={userForm.nombre}
                onChange={(event) =>
                  setUserForm((current) => ({
                    ...current,
                    nombre: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Correo
              </span>
              <input
                type="email"
                value={userForm.correo}
                onChange={(event) =>
                  setUserForm((current) => ({
                    ...current,
                    correo: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                required
              />
            </label>

            {!editingUser && (
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Password
                </span>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(event) =>
                    setUserForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  minLength={6}
                  required
                />
              </label>
            )}

            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase text-gray-500">
                Rol
              </span>
              <select
                value={userForm.rol}
                onChange={(event) =>
                  setUserForm((current) => ({
                    ...current,
                    rol: event.target.value as UsuarioForm['rol'],
                  }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              >
                <option value="ADMIN">Administrador</option>
                <option value="OPERADOR">Operador</option>
                <option value="VISOR">Visor</option>
              </select>
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={userForm.activo}
                onChange={(event) =>
                  setUserForm((current) => ({
                    ...current,
                    activo: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              Usuario activo
            </label>
          </div>

          <button
            type="submit"
            disabled={userSubmitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            <FiSave className="h-4 w-4" />
            {userSubmitting ? 'Guardando...' : 'Guardar usuario'}
          </button>
        </form>
      </section>
    </div>
  );
}

function toDateInputValue(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function formatOptionalDate(value?: string | null) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return formatDate(value);
}
