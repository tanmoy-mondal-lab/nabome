/**
 * Product Card Skeleton Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays a loading skeleton for product cards. Used while product data
 * is being fetched to provide visual feedback and prevent layout shift.
 */

import { Card, Skeleton } from './index';

interface ProductCardSkeletonProps {
  variant?: 'standard' | 'compact' | 'featured' | 'recommendation';
  className?: string;
}

export function ProductCardSkeleton({
  variant = 'standard',
  className = '',
}: ProductCardSkeletonProps) {
  return (
    <Card
      className={`product-card-skeleton product-card-skeleton--${variant} ${className}`}
    >
      <div className="product-card-skeleton__image-wrapper">
        <Skeleton className="product-card-skeleton__image" />
      </div>

      <div className="product-card-skeleton__content">
        {/* Meta */}
        <Skeleton
          className="product-card-skeleton__meta"
          style={{ width: '60%', height: '16px' }}
        />

        {/* Name */}
        <Skeleton
          className="product-card-skeleton__name"
          style={{ width: '80%', height: '20px' }}
        />

        {/* Price */}
        <div className="product-card-skeleton__price">
          <Skeleton
            className="product-card-skeleton__current-price"
            style={{ width: '40%', height: '24px' }}
          />
        </div>

        {/* Rating */}
        <Skeleton
          className="product-card-skeleton__rating"
          style={{ width: '30%', height: '16px' }}
        />

        {/* Button */}
        <Skeleton
          className="product-card-skeleton__button"
          style={{ width: '100%', height: '36px' }}
        />
      </div>
    </Card>
  );
}
