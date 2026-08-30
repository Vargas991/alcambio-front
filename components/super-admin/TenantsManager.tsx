'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import {
  FiEdit2,
  FiExternalLink,
  FiLogIn,
  FiPlus,
  FiSave,
  FiX,
} from 'react-icons/fi';

import { logout } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import type { Tenant } from '@/types/tenants';

type TenantsManagerProps = {
  tenants: Tenant[];
};

type TenantForm = {
  id?: string;
  nombre: string;
  slug: string;
  activo: boolean;
  fechaActivacion: string;
  fechaRenovacion: string;
  periodoRenovacion: Tenant['periodoRenovacion'];
};

const emptyForm: TenantForm = {
  nombre: '',
  slug: '',
  activo: true,
  fechaActivacion: toDateInputValue(new Date().toISOString()),
  fechaRenovacion: '',
  periodoRenovacion: 'MENSUAL',
};

export function TenantsManager({ tenants }: TenantsManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState<TenantForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleNew() {
    setForm(emptyForm);
    setFormOpen(true);
  }

  function handleEdit(tenant: Tenant) {
    setForm({
      id: tenant.id,
      nombre: tenant.nombre,
      slug: tenant.slug,
      activo: tenant.activo,
      fechaActivacion: toDateInputValue(tenant.fechaActivacion),
      fechaRenovacion: tenant.fechaRenovacion
        ? toDateInputValue(tenant.fechaRenovacion)
        : '',
      periodoRenovacion: tenant.periodoRenovacion ?? 'MENSUAL',
    });
    setFormOpen(true);
  }

  function handleCloseForm() {
    if (submitting) {
      return;
    }

    setFormOpen(false);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        slug: form.slug.trim() || undefined,
        activo: form.activo,
        fechaActivacion: form.fechaActivacion || undefined,
        fechaRenovacion: form.fechaRenovacion || undefined,
        periodoRenovacion: form.periodoRenovacion,
      };

      if (form.id) {
        await api.patch(`/super-admin/tenants/${form.id}`, payload);
      } else {
        await api.post('/super-admin/tenants', payload);
      }

      setForm(emptyForm);
      setFormOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('No fue posible guardar el tenant.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEnterDashboard(tenant: Tenant) {
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
      <section className="min-w-0">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
            <p className="mt-1 text-sm text-gray-500">
              Administra organizaciones y su estado de acceso.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <FiPlus className="h-4 w-4" />
            Nuevo
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Organizacion</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Usuarios</th>
                <th className="px-4 py-3">Fecha activacion</th>
                <th className="px-4 py-3">Fecha renovacion</th>
                <th className="px-4 py-3">Periodo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {tenant.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{tenant.slug}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {tenant._count?.usuarios ?? tenant.usuarios?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatOptionalDate(tenant.fechaActivacion)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatOptionalDate(tenant.fechaRenovacion)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tenant.periodoRenovacion === 'ANUAL' ? 'Anual' : 'Mensual'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-semibold',
                        tenant.activo
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600',
                      ].join(' ')}
                    >
                      {tenant.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        title="Editar tenant"
                        onClick={() => handleEdit(tenant)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/super-admin/tenants/${tenant.id}`}
                        title="Administrar tenant"
                        className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <FiExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        title={
                          tenant.activo
                            ? 'Entrar al dashboard'
                            : 'Tenant inactivo'
                        }
                        onClick={() => handleEnterDashboard(tenant)}
                        disabled={!tenant.activo}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiLogIn className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(100vh-48px)] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {form.id ? 'Editar tenant' : 'Nuevo tenant'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Define acceso, activacion y renovacion.
                </p>
              </div>
              <button
                type="button"
                title="Cerrar"
                onClick={handleCloseForm}
                disabled={submitting}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Nombre
                </span>
                <input
                  value={form.nombre}
                  onChange={(event) =>
                    setForm((current) => ({
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
                  Slug
                </span>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="mi-organizacion"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </label>

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      activo: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                Tenant activo
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Fecha activacion
                </span>
                <input
                  type="date"
                  value={form.fechaActivacion}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fechaActivacion: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Fecha renovacion
                </span>
                <input
                  type="date"
                  value={form.fechaRenovacion}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fechaRenovacion: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Periodo
                </span>
                <select
                  value={form.periodoRenovacion}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      periodoRenovacion: event.target
                        .value as Tenant['periodoRenovacion'],
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                >
                  <option value="MENSUAL">Mensual</option>
                  <option value="ANUAL">Anual</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={submitting}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
              >
                <FiSave className="h-4 w-4" />
                {submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
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
