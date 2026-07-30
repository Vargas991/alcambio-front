"use client";

import Image from "next/image";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { FiImage, FiSave, FiTrash2, FiUpload } from "react-icons/fi";

import { useRouter } from "next/navigation";

import type { ConfiguracionOrganizacion } from "@/types/configuracion";

type OrganizacionFormProps = {
  configuracion: ConfiguracionOrganizacion;
};

type FormState = {
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  monedaBase: ConfiguracionOrganizacion["monedaBase"];
  zonaHoraria: string;
};

const API_PUBLIC_URL = process.env.NEXT_PUBLIC_NEST_API_URL ?? "";

export function OrganizacionForm({ configuracion }: OrganizacionFormProps) {
  const router = useRouter();

  const [logoUrl, setLogoUrl] = useState<string | null>(configuracion.logoUrl);

  const [logoVersion, setLogoVersion] = useState(() => Date.now());

  const [form, setForm] = useState<FormState>({
    nombre: configuracion.nombre,

    telefono: configuracion.telefono ?? "",

    correo: configuracion.correo ?? "",

    direccion: configuracion.direccion ?? "",

    monedaBase: configuracion.monedaBase,

    zonaHoraria: configuracion.zonaHoraria,
  });

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [deletingLogo, setDeletingLogo] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const currentLogoUrl = useMemo(() => {
    if (previewUrl) {
      return previewUrl;
    }

    if (!logoUrl) {
      return null;
    }

    /*
     * Usamos el proxy de Next para evitar
     * contenido mixto HTTP/HTTPS.
     *
     * logoVersion invalida la caché cuando
     * el logo cambia.
     */
    return `/api/organizacion/logo?v=${logoVersion}`;
  }, [logoUrl, logoVersion, previewUrl]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("El logo debe ser PNG, JPG o WEBP.");

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("El logo no puede superar los 2 MB.");

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedLogo(file);

    setPreviewUrl(URL.createObjectURL(file));

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/backend/configuracion/organizacion", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nombre: form.nombre.trim(),

          telefono: form.telefono.trim() || null,

          correo: form.correo.trim() || null,

          direccion: form.direccion.trim() || null,

          monedaBase: form.monedaBase,

          zonaHoraria: form.zonaHoraria,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "No fue posible actualizar la configuración."
        );
      }

      setSuccessMessage("Configuración actualizada correctamente.");

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar la configuración."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadLogo() {
    if (!selectedLogo) {
      setErrorMessage("Selecciona un logo.");

      return;
    }

    setUploadingLogo(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const body = new FormData();

      body.append("logo", selectedLogo);

      const response = await fetch(
        "/api/backend/configuracion/organizacion/logo",
        {
          method: "POST",
          body,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No fue posible actualizar el logo.");
      }

      const nuevaConfiguracion = data.data ?? data;

      setLogoUrl(nuevaConfiguracion.logoUrl);

      setLogoVersion(Date.now());

      setSelectedLogo(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      setSuccessMessage("Logo actualizado correctamente.");

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el logo."
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleDeleteLogo() {
    const confirmed = window.confirm(
      "¿Deseas eliminar el logo de la organización?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingLogo(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        "/api/backend/configuracion/organizacion/logo",
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No fue posible eliminar el logo.");
      }

      setLogoUrl(null);
      setLogoVersion(Date.now());
      setSelectedLogo(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(null);

      setSuccessMessage("Logo eliminado correctamente.");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el logo."
      );
    } finally {
      setDeletingLogo(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            Identidad visual
          </h2>

          <p className="text-sm text-gray-500">
            Personaliza el nombre y el logo que se muestran en el sistema.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <div>
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
              {currentLogoUrl ? (
                <Image
                  src={currentLogoUrl}
                  alt={`Logo de ${form.nombre}`}
                  width={144}
                  height={144}
                  unoptimized
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <FiImage className="h-10 w-10 text-gray-300" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="logo"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Logo
              </label>

              <input
                id="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
              />

              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG o WEBP. Máximo 2 MB.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUploadLogo}
                disabled={!selectedLogo || uploadingLogo}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiUpload className="h-4 w-4" />

                {uploadingLogo ? "Subiendo..." : "Guardar logo"}
              </button>

              {logoUrl && (
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  disabled={deletingLogo}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiTrash2 className="h-4 w-4" />

                  {deletingLogo ? "Eliminando..." : "Eliminar logo"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            Información general
          </h2>

          <p className="text-sm text-gray-500">
            Datos principales de la organización.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="nombre"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Nombre de la organización
            </label>

            <input
              id="nombre"
              value={form.nombre}
              onChange={(event) => updateField("nombre", event.target.value)}
              required
              maxLength={150}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>

            <input
              id="telefono"
              value={form.telefono}
              onChange={(event) => updateField("telefono", event.target.value)}
              maxLength={30}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="correo"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>

            <input
              id="correo"
              type="email"
              value={form.correo}
              onChange={(event) => updateField("correo", event.target.value)}
              maxLength={150}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="direccion"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Dirección
            </label>

            <textarea
              id="direccion"
              value={form.direccion}
              onChange={(event) => updateField("direccion", event.target.value)}
              maxLength={250}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* <div>
            <label
              htmlFor="monedaBase"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Moneda base
            </label>

            <select
              id="monedaBase"
              value={form.monedaBase}
              onChange={(event) =>
                updateField(
                  'monedaBase',
                  event.target
                    .value as FormState['monedaBase'],
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="COP">
                COP
              </option>

              <option value="BS">
                BS
              </option>

              <option value="USD">
                USD
              </option>

              <option value="USDT">
                USDT
              </option>
            </select>
          </div> */}

          {/* <div>
            <label
              htmlFor="zonaHoraria"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Zona horaria
            </label>

            <select
              id="zonaHoraria"
              value={form.zonaHoraria}
              onChange={(event) =>
                updateField(
                  'zonaHoraria',
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="America/Caracas">
                Venezuela
              </option>

              <option value="America/Bogota">
                Colombia
              </option>
            </select>
          </div> */}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving || !form.nombre.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" />

            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </section>
    </form>
  );
}
