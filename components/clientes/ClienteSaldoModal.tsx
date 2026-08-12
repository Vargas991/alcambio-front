"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { api } from "@/lib/api";
import { formatNumber } from "@/lib/formatters";
import {
  numberToInputValue,
  parseFormattedNumber,
} from "@/lib/number-format";
import { FormattedNumberInput } from "@/components/ui/FormattedNumberInput";
import type { Moneda } from "@/types/operaciones";

type TipoSaldo = "ME_DEBE" | "LE_DEBO" | "SALDADO";

type ClienteSaldoModalProps = {
  open: boolean;
  onClose: () => void;
  clienteId: string;
  clienteNombre: string;
  moneda: Moneda;
  saldoActual: number;
  onSuccess?: () => void;
};

function getTipoSaldoInicial(saldo: number): TipoSaldo {
  if (saldo === 0) {
    return "SALDADO";
  }

  return saldo < 0 ? "LE_DEBO" : "ME_DEBE";
}

export function ClienteSaldoModal({
  open,
  onClose,
  clienteId,
  clienteNombre,
  moneda,
  saldoActual,
  onSuccess,
}: ClienteSaldoModalProps) {
  const router = useRouter();

  const [monto, setMonto] = useState(
    numberToInputValue(Math.abs(saldoActual)),
  );
  const [tipoSaldo, setTipoSaldo] = useState<TipoSaldo>(
    getTipoSaldoInicial(saldoActual),
  );
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setMonto(numberToInputValue(Math.abs(saldoActual)));
    setTipoSaldo(getTipoSaldoInicial(saldoActual));
    setMotivo("");
    setErrorMessage("");
  }, [open, saldoActual, moneda, clienteId]);

  if (!open) {
    return null;
  }

  const montoNumber = parseFormattedNumber(monto);

  const saldoObjetivo =
    tipoSaldo === "SALDADO"
      ? 0
      : tipoSaldo === "LE_DEBO"
        ? -Math.abs(montoNumber)
        : Math.abs(montoNumber);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!clienteId || clienteId === "undefined") {
      setErrorMessage(
        "No se recibió el identificador del cliente.",
      );
      return;
    }

    if (!motivo.trim()) {
      setErrorMessage("Ingrese el motivo del ajuste.");
      return;
    }

    if (
      tipoSaldo !== "SALDADO" &&
      (!Number.isFinite(montoNumber) || montoNumber < 0)
    ) {
      setErrorMessage("Ingrese un saldo válido.");
      return;
    }

    setSaving(true);

    try {
      await api.patch(
        `/clientes/${clienteId}/ajustar-saldo`,
        {
          moneda,
          saldoObjetivo,
          motivo: motivo.trim(),
        },
      );

      router.refresh();
      onSuccess?.();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        setErrorMessage(
          Array.isArray(message)
            ? message.join(", ")
            : message ??
                "No fue posible ajustar el saldo.",
        );
      } else {
        setErrorMessage(
          "No fue posible ajustar el saldo.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Ajustar saldo en {moneda}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {clienteNombre}
          </p>

          <p className="mt-1 text-xs font-medium text-gray-400">
            Saldo actual:{" "}
            {formatNumber(Math.abs(saldoActual))} {moneda}
            {" · "}
            {saldoActual > 0
              ? "Me debe"
              : saldoActual < 0
                ? "Le debo"
                : "Saldado"}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Tipo de saldo
            </label>

            <select
              value={tipoSaldo}
              onChange={(event) =>
                setTipoSaldo(
                  event.target.value as TipoSaldo,
                )
              }
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ME_DEBE">Me debe</option>
              <option value="LE_DEBO">Le debo</option>
              <option value="SALDADO">Saldado</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Nuevo saldo
            </label>

            <FormattedNumberInput
              value={
                tipoSaldo === "SALDADO"
                  ? numberToInputValue(0)
                  : monto
              }
              onChange={(value) => setMonto(value)}
              placeholder="0"
              disabled={tipoSaldo === "SALDADO"}
            />

            <p className="mt-1 text-xs text-gray-400">
              El saldo se registrará en {moneda}.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Motivo
            </label>

            <textarea
              value={motivo}
              onChange={(event) =>
                setMotivo(event.target.value)
              }
              placeholder="Motivo del ajuste"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Guardando..."
                : "Guardar ajuste"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}