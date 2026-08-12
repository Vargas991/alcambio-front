import { DEFAULT_TIME_ZONE, formatDateTimeInTimeZone } from './dates';

export function formatMoney(value: number | string) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatNumber(value: number | string) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

/**
 * Formats a date/time using the provided `timeZone`.
 * If `timeZone` is omitted, falls back to a central default (not the browser timezone).
 */
export function formatDate(value: string | Date, timeZone?: string) {
  const tz = timeZone ?? DEFAULT_TIME_ZONE;
  return formatDateTimeInTimeZone(value, tz);
}

export default formatDate;