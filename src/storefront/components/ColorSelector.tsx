import { cn } from "../../lib/utils/cn";

interface ColorOption {
  hex: string;
  name: string;
}

interface ColorSelectorProps {
  colors: ColorOption[];
  selected: string;
  onChange: (hex: string) => void;
}

export function ColorSelector({ colors, selected, onChange }: ColorSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-widest text-neutral-700 font-medium">
        Color: <span className="text-neutral-400 font-normal normal-case">{colors.find((c) => c.hex === selected)?.name || "Select"}</span>
      </p>
      <div className="flex flex-wrap gap-3">
        {colors.map((c) => (
          <button
            key={c.hex}
            onClick={() => onChange(c.hex)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all",
              selected === c.hex ? "border-neutral-900 scale-110" : "border-neutral-200 hover:border-neutral-400"
            )}
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        ))}
      </div>
    </div>
  );
}
