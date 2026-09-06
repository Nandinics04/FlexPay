import { MAX_QTY } from '../utils/checkout';

export function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="inline-grid h-9 grid-cols-3 items-center overflow-hidden rounded-full border border-slate-200 bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="flex h-full w-9 items-center justify-center text-base leading-none text-slate-700 disabled:text-slate-300"
      >
        −
      </button>
      <span className="flex h-full w-9 items-center justify-center text-sm font-semibold leading-none text-slate-900">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= MAX_QTY}
        onClick={() => onChange(value + 1)}
        className="flex h-full w-9 items-center justify-center text-base leading-none text-slate-700 disabled:text-slate-300"
      >
        +
      </button>
    </div>
  );
}
