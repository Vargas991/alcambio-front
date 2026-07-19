'use client';

import { formatNumberInput, parseFormattedNumber } from '@/lib/number-format';

type FormattedNumberInputProps = {
  value: string;
  onChange: (value: string, numericValue: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
};

export function FormattedNumberInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  name,
  id,
}: FormattedNumberInputProps) {
  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="decimal"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      onChange={(event) => {
        const formattedValue = formatNumberInput(event.target.value);
        const numericValue = parseFormattedNumber(formattedValue);

        onChange(formattedValue, numericValue);
      }}
    />
  );
}