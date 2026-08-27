import { useState } from 'react';

import { useWishlistStore } from '@/stores/wishlist-store';

interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function WishlistButton({
  productId,
  variantId,
  className = '',
  size = 'md',
  showLabel = false,
}: WishlistButtonProps) {
  const { isInWishlist, addGuestItem, removeGuestItem, isGuest } =
    useWishlistStore();
  const [isAnimating, setIsAnimating] = useState(false);

  const inWishlist = isInWishlist(productId, variantId || null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (inWishlist) {
      removeGuestItem(productId, variantId || null);
    } else {
      addGuestItem(productId, variantId || null);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center rounded-full
        transition-all duration-200 ease-in-out
        ${inWishlist ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
        ${sizeClasses[size]}
        ${className}
        ${isAnimating ? 'scale-110' : 'scale-100'}
      `}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inWishlist}
    >
      <svg
        className={iconSize[size]}
        fill={inWishlist ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {inWishlist ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
