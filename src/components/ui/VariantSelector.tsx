// ─────────────────────────────────────────────────────────────
// VARIANT SELECTOR COMPONENT
// ─────────────────────────────────────────────────────────────
// Product variant selection (color, size, etc.)
// ─────────────────────────────────────────────────────────────

import { cn } from "../../lib/utils/cn";

export interface VariantOption {
  id: string;
  name: string;
  value: string;
  available: boolean;
  price?: number;
}

export interface VariantGroup {
  name: string;
  options: VariantOption[];
}

interface VariantSelectorProps {
  groups: VariantGroup[];
  selectedVariants: Record<string, string>;
  onVariantChange: (groupName: string, optionId: string) => void;
  className?: string;
}

export function VariantSelector({
  groups,
  selectedVariants,
  onVariantChange,
  className,
}: VariantSelectorProps) {
  if (groups.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {groups.map((group) => (
        <div key={group.name}>
          <h3 className="font-medium mb-2">{group.name}</h3>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = selectedVariants[group.name] === option.id;
              const isUnavailable = !option.available;

              return (
                <button
                  key={option.id}
                  onClick={() => !isUnavailable && onVariantChange(group.name, option.id)}
                  disabled={isUnavailable}
                  className={cn(
                    "px-4 py-2 rounded-md border text-sm font-medium transition-colors",
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 hover:border-gray-400",
                    isUnavailable && "opacity-50 cursor-not-allowed bg-gray-100"
                  )}
                  aria-label={`Select ${option.name}`}
                  aria-disabled={isUnavailable}
                >
                  {option.name}
                  {option.price && option.price > 0 && (
                    <span className="ml-1 text-xs opacity-75">
                      (+${option.price.toFixed(2)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ColorVariantSelectorProps {
  options: VariantOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ColorVariantSelector({
  options,
  selectedId,
  onSelect,
  className,
}: ColorVariantSelectorProps) {
  if (options.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium">Color</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const isUnavailable = !option.available;

          return (
            <button
              key={option.id}
              onClick={() => !isUnavailable && onSelect(option.id)}
              disabled={isUnavailable}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all relative",
                isSelected ? "border-blue-600 scale-110" : "border-gray-300",
                isUnavailable && "opacity-50 cursor-not-allowed"
              )}
              style={{ backgroundColor: option.value }}
              aria-label={`Select ${option.name}`}
              aria-disabled={isUnavailable}
              title={option.name}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
