import { cn } from "../../lib/utils/cn";

interface SizeSelectorProps {
  sizes: string[];
  selected: string;
  onChange: (size: string) => void;
  stock?: Record<string, number>;
}

export function SizeSelector({ sizes, selected, onChange, stock }: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-neutral-700 font-medium">Size</p>
        <span className="text-xs text-neutral-400">{selected || "Select size"}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const qty = stock?.[size] ?? 0;
          const isOut = qty === 0;
          return (
            <button
              key={size}
              onClick={() => !isOut && onChange(size)}
              disabled={isOut}
              className={cn(
                "min-w-[3rem] px-4 py-3 text-sm border transition-all",
                selected === size
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : isOut
                    ? "border-neutral-100 text-neutral-300 line-through cursor-not-allowed"
                    : "border-neutral-200 hover:border-neutral-900 text-neutral-700"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
