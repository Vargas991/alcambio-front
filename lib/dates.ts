export const DEFAULT_TIME_ZONE = 'America/Caracas';

export function formatDateTimeInTimeZone(value: string | Date, timeZone: string) {
  if (!value) return '-';

  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function formatDateInTimeZone(value: string | Date, timeZone: string) {
  if (!value) return '-';

  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeZone,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function formatTimeInTimeZone(value: string | Date, timeZone: string) {
  if (!value) return '-';

  try {
    return new Intl.DateTimeFormat('es-CO', {
      timeStyle: 'short',
      timeZone,
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function getTodayInTimeZone(timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: DEFAULT_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }
}
