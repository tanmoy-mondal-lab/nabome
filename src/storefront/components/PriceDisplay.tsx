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
    <div className={cn("flex items-center gap-2", sizes[size], className)}>
      <span className="font-medium text-neutral-900">{formatPrice(price)}</span>
      {discount > 0 && (
        <>
          <span className="text-neutral-400 line-through text-xs">{formatPrice(compareAtPrice!)}</span>
          <span className="text-xs text-red-500 font-medium">{discount}% OFF</span>
        </>
      )}
    </div>
  );
}
