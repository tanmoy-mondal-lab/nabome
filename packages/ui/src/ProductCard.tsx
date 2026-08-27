/**
 * Standard Product Card Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays product information in a standard card format with image, name, price,
 * and action buttons. Used in product grids, category pages, and search results.
 */

import type { Product } from '@nabome/types';

import { Card, Button, Badge, Text, Image } from './index';

interface ProductCardProps {
  product: Product;
  variant?: 'standard' | 'compact' | 'featured' | 'recommendation';
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showQuickView?: boolean;
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

/**
 * Calculate discount percentage
 */
function getDiscountPercentage(product: Product): number {
  if (!product.compareAtPrice) return 0;
  const basePrice =
    typeof product.basePrice === 'string'
      ? parseFloat(product.basePrice)
      : parseFloat(product.basePrice.amount);
  const comparePrice =
    typeof product.compareAtPrice === 'string'
      ? parseFloat(product.compareAtPrice)
      : parseFloat(product.compareAtPrice.amount);
  return Math.round(((comparePrice - basePrice) / comparePrice) * 100);
}

export function ProductCard({
  product,
  variant = 'standard',
  showAddToCart = true,
  showWishlist = true,
  showQuickView = false,
  className = '',
  linkComponent: LinkComponent,
}: ProductCardProps) {
  const primaryImage = getPrimaryImage(product);
  const discount = hasDiscount(product);
  const discountPercent = getDiscountPercentage(product);

  const isOutOfStock = product.variants?.every(
    (v) => v.availableStock - v.reservedStock <= 0,
  );

  return (
    <Card className={`product-card product-card--${variant} ${className}`}>
      <div className="product-card__image-wrapper">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
          />
        ) : (
          <div className="product-card__image-placeholder" />
        )}

        {/* Badges */}
        <div className="product-card__badges">
          {product.isNew && <Badge variant="success">New</Badge>}
          {product.isFeatured && <Badge variant="brand">Featured</Badge>}
          {product.isTrending && <Badge variant="info">Trending</Badge>}
          {discount && <Badge variant="error">{discountPercent}% OFF</Badge>}
          {isOutOfStock && <Badge variant="neutral">Out of Stock</Badge>}
        </div>

        {/* Quick Actions */}
        <div className="product-card__quick-actions">
          {showWishlist && (
            <Button
              variant="ghost"
              size="sm"
              className="product-card__wishlist"
              aria-label="Add to wishlist"
            >
              ♥
            </Button>
          )}
          {showQuickView && (
            <Button
              variant="ghost"
              size="sm"
              className="product-card__quick-view"
              aria-label="Quick view"
            >
              👁
            </Button>
          )}
        </div>
      </div>

      <div className="product-card__content">
        {/* Category/Brand */}
        {(product.category || product.brand) && (
          <Text size="xs" color="secondary" className="product-card__meta">
            {product.category?.name || product.brand?.name}
          </Text>
        )}

        {/* Product Name */}
        {LinkComponent ? (
          <LinkComponent to={`/products/${product.slug}`}>
            <Text size="base" weight="semibold" className="product-card__name">
              {product.name}
            </Text>
          </LinkComponent>
        ) : (
          <a
            href={`/products/${product.slug}`}
            className="product-card__name-link"
          >
            <Text size="base" weight="semibold" className="product-card__name">
              {product.name}
            </Text>
          </a>
        )}

        {/* Price */}
        <div className="product-card__price">
          <Text size="lg" weight="bold" className="product-card__current-price">
            {formatPrice(product.basePrice)}
          </Text>
          {discount && (
            <Text
              size="sm"
              color="secondary"
              className="product-card__compare-price"
            >
              {formatPrice(product.compareAtPrice!)}
            </Text>
          )}
        </div>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="product-card__rating">
            <Text size="sm" color="secondary">
              ★ {product.averageRating.toFixed(1)} ({product.reviewCount})
            </Text>
          </div>
        )}

        {/* Add to Cart Button */}
        {showAddToCart && !isOutOfStock && (
          <Button
            variant="primary"
            size="sm"
            className="product-card__add-to-cart"
            fullWidth
          >
            Add to Cart
          </Button>
        )}

        {isOutOfStock && (
          <Button
            variant="ghost"
            size="sm"
            className="product-card__out-of-stock"
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
