import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { useAddToWishlist, useRemoveFromWishlist } from "../hooks/useWishlist";

interface WishlistButtonProps {
  variantId: string;
  isInWishlist?: boolean;
  onToggle?: (isInWishlist: boolean) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({
  variantId,
  isInWishlist: initialIsInWishlist = false,
  onToggle,
  className,
  size = "md",
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const isPending = addToWishlist.isPending || removeFromWishlist.isPending;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    if (isInWishlist) {
      await removeFromWishlist.mutateAsync(variantId);
      setIsInWishlist(false);
    } else {
      await addToWishlist.mutateAsync(variantId);
      setIsInWishlist(true);
    }

    onToggle?.(!isInWishlist);
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex items-center justify-center transition-colors",
        isInWishlist ? "text-red-500" : "text-neutral-400 hover:text-red-500",
        isPending && "opacity-50 cursor-not-allowed",
        sizeClasses[size],
        className
      )}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isPending ? (
        <Loader2 className="w-full h-full animate-spin" />
      ) : (
        <Heart className={cn("w-full h-full", isInWishlist && "fill-current")} />
      )}
    </button>
  );
}
