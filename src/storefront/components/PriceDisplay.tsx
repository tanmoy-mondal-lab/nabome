import { formatPrice } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({ price, compareAtPrice, size = "md", className }: PriceDisplayProps) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-lg" };
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", sizes[size], className)}>
      <span className="font-medium text-neutral-900">{formatPrice(price)}</span>
      {discount > 0 && (
        <>
          <span className="text-neutral-400 line-through text-xs">{formatPrice(compareAtPrice!)}</span>
          <span className="text-[10px] tracking-wider uppercase font-medium text-accent-rose">{discount}% off</span>
        </>
      )}
    </div>
  );
}
