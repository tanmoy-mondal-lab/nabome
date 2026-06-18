import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, min = 1, max = 99, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-neutral-200">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="px-3 py-2 hover:bg-neutral-50 disabled:opacity-30 transition-colors">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="px-3 py-2 hover:bg-neutral-50 disabled:opacity-30 transition-colors">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
