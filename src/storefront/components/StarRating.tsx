import { Star } from "lucide-react";
import { cn } from "../../lib/utils/cn";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function StarRating({ rating, max = 5, size = 14, showValue, className }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-neutral-200")}
        />
      ))}
      {showValue && <span className="text-xs text-neutral-500 ml-1">({rating.toFixed(1)})</span>}
    </div>
  );
}
