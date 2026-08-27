/**
 * Recommendation Product Card Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays product information in a recommendation card format with emphasis
 * on why it's recommended. Used for "You May Also Like", "Related Products",
 * and recommendation sections.
 */

import type { Product } from '@nabome/types';

import { Card, Button, Badge, Text, Image } from './index';

interface ProductCardRecommendationProps {
  product: Product;
  reason?: string;
  showAddToCart?: boolean;
  className?: string;
  linkComponent?: React.ComponentType<{
    to: string;
    children: React.ReactNode;
  }>;
}

/**
 * Format price in Indian Rupees
 */
function formatPrice(price: string | { amount: string }): string {
  const num =
    typeof price === 'string' ? parseFloat(price) : parseFloat(price.amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Get primary image from product media
 */
function getPrimaryImage(product: Product): string | undefined {
  return (
    product.media?.find((m) => m.sortOrder === 0)?.url ||
    product.media?.[0]?.url
  );
}

/**
 * Check if product has discount
 */
function hasDiscount(product: Product): boolean {
  if (!product.compareAtPrice) return false;
  const basePrice =
    typeof product.basePrice === 'string'
      ? parseFloat(product.basePrice)
      : parseFloat(product.basePrice.amount);
  const comparePrice =
    typeof product.compareAtPrice === 'string'
      ? parseFloat(product.compareAtPrice)
      : parseFloat(product.compareAtPrice.amount);
  return comparePrice > basePrice;
}

export function ProductCardRecommendation({
  product,
  reason = 'Recommended for you',
  showAddToCart = true,
  className = '',
  linkComponent: LinkComponent,
}: ProductCardRecommendationProps) {
  const primaryImage = getPrimaryImage(product);
  const discount = hasDiscount(product);

  const isOutOfStock = product.variants?.every(
    (v) => v.availableStock - v.reservedStock <= 0,
  );

  return (
    <Card className={`product-card-recommendation ${className}`}>
      <div className="product-card-recommendation__image-wrapper">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            className="product-card-recommendation__image"
            loading="lazy"
          />
        ) : (
          <div className="product-card-recommendation__image-placeholder" />
        )}

        {/* Discount Badge */}
        {discount && (
          <Badge
            variant="error"
            className="product-card-recommendation__discount-badge"
          >
            Sale
          </Badge>
        )}
      </div>

      <div className="product-card-recommendation__content">
        {/* Recommendation Reason */}
        <Text
          size="xs"
          color="brand"
          weight="medium"
          className="product-card-recommendation__reason"
        >
          {reason}
        </Text>

        {/* Product Name */}
        {LinkComponent ? (
          <LinkComponent to={`/products/${product.slug}`}>
            <Text
              size="base"
              weight="semibold"
              className="product-card-recommendation__name"
            >
              {product.name}
            </Text>
          </LinkComponent>
        ) : (
          <a
            href={`/products/${product.slug}`}
            className="product-card-recommendation__name-link"
          >
            <Text
              size="base"
              weight="semibold"
              className="product-card-recommendation__name"
            >
              {product.name}
            </Text>
          </a>
        )}

        {/* Price */}
        <div className="product-card-recommendation__price">
          <Text
            size="lg"
            weight="bold"
            className="product-card-recommendation__current-price"
          >
            {formatPrice(product.basePrice)}
          </Text>
          {discount && (
            <Text
              size="sm"
              color="secondary"
              className="product-card-recommendation__compare-price"
            >
              {formatPrice(product.compareAtPrice!)}
            </Text>
          )}
        </div>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="product-card-recommendation__rating">
            <Text size="xs" color="secondary">
              ★ {product.averageRating.toFixed(1)}
            </Text>
          </div>
        )}

        {/* Add to Cart Button */}
        {showAddToCart && !isOutOfStock && (
          <Button
            variant="primary"
            size="sm"
            className="product-card-recommendation__add-to-cart"
            fullWidth
          >
            Add to Cart
          </Button>
        )}

        {isOutOfStock && (
          <Button
            variant="ghost"
            size="sm"
            className="product-card-recommendation__out-of-stock"
            fullWidth
            disabled
          >
            Out of Stock
          </Button>
        )}
      </div>
    </Card>
  );
}
