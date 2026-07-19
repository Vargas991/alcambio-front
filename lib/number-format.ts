export function formatNumberInput(value: string): string {
  if (!value) return '';

  const cleanValue = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');

  if (!cleanValue) return '';

  const [integerPart, decimalPart] = cleanValue.split('.');

  const formattedInteger = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(Number(integerPart || 0));

  if (decimalPart !== undefined) {
    return `${formattedInteger},${decimalPart.slice(0, 6)}`;
  }

  return formattedInteger;
}

export function parseFormattedNumber(value: string): number {
  if (!value) return 0;

  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');

  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function numberToInputValue(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') return '';

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return '';

  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(numberValue);
}