/**
 * Product Reviews Component (Placeholder)
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays product reviews and ratings. This is a placeholder component
 * that will be expanded when the full review system is implemented.
 */

import type { Review } from '@nabome/types';

import { Button, Text, Heading, EmptyState } from './index';

interface ProductReviewsProps {
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
  onWriteReview?: () => void;
  onViewAllReviews?: () => void;
  className?: string;
}

/**
 * Format rating display
 */
function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Render star rating
 */
function renderStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars)
  );
}

export function ProductReviews({
  reviews = [],
  averageRating = 0,
  reviewCount = 0,
  onWriteReview,
  onViewAllReviews,
  className = '',
}: ProductReviewsProps) {
  const displayReviews = reviews.slice(0, 3);

  if (reviewCount === 0) {
    return (
      <div className={`product-reviews product-reviews--empty ${className}`}>
        <EmptyState
          title="No reviews yet"
          description="Be the first to review this product"
        />
        {onWriteReview && (
          <Button
            variant="primary"
            onClick={onWriteReview}
            className="product-reviews__write-first"
          >
            Write a Review
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`product-reviews ${className}`}>
      {/* Summary */}
      <div className="product-reviews__summary">
        <Heading level="h4">Customer Reviews</Heading>
        <div className="product-reviews__rating-summary">
          <div className="product-reviews__average-rating">
            <Text size="xl" weight="bold">
              {formatRating(averageRating)}
            </Text>
            <div className="product-reviews__stars">
              {renderStars(averageRating)}
            </div>
          </div>
          <div className="product-reviews__total-count">
            <Text size="sm" color="secondary">
              Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </Text>
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="product-reviews__list">
        {displayReviews.map((review) => (
          <div key={review.id} className="product-reviews__item">
            <div className="product-reviews__item-header">
              <div className="product-reviews__item-rating">
                <Text size="xs" color="brand">
                  {renderStars(review.rating)}
                </Text>
              </div>
              {review.title && (
                <Text
                  size="sm"
                  weight="semibold"
                  className="product-reviews__item-title"
                >
                  {review.title}
                </Text>
              )}
            </div>
            {review.body && (
              <Text
                size="sm"
                color="secondary"
                className="product-reviews__item-body"
              >
                {review.body}
              </Text>
            )}
            {review.verifiedPurchase && (
              <Text
                size="xs"
                color="success"
                className="product-reviews__verified"
              >
                ✓ Verified Purchase
              </Text>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="product-reviews__actions">
        {onViewAllReviews && reviews.length > 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAllReviews}
            className="product-reviews__view-all"
          >
            View All {reviewCount} Reviews
          </Button>
        )}
        {onWriteReview && (
          <Button
            variant="primary"
            size="sm"
            onClick={onWriteReview}
            className="product-reviews__write"
          >
            Write a Review
          </Button>
        )}
      </div>
    </div>
  );
}
