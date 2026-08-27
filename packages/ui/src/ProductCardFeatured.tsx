/**
 * Featured Product Card Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays product information in a featured card format with larger image,
 * prominent display, and enhanced visual treatment. Used for hero sections,
 * featured product displays, and promotional areas.
 */

import type { Product } from '@nabome/types';

import { Card, Button, Badge, Text, Image } from './index';

interface ProductCardFeaturedProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlist?: boolean;
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

export function ProductCardFeatured({
  product,
  showAddToCart = true,
  showWishlist = true,
  className = '',
  linkComponent: LinkComponent,
}: ProductCardFeaturedProps) {
  const primaryImage = getPrimaryImage(product);
  const discount = hasDiscount(product);
  const discountPercent = getDiscountPercentage(product);

  const isOutOfStock = product.variants?.every(
    (v) => v.availableStock - v.reservedStock <= 0,
  );

  return (
    <Card className={`product-card-featured ${className}`}>
      {/* Large Image */}
      <div className="product-card-featured__image-wrapper">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={product.name}
            className="product-card-featured__image"
            loading="lazy"
          />
        ) : (
          <div className="product-card-featured__image-placeholder" />
        )}

        {/* Featured Badge */}
        <div className="product-card-featured__badges">
          {product.isFeatured && <Badge variant="brand">Featured</Badge>}
          {product.isNew && <Badge variant="success">New</Badge>}
          {discount && <Badge variant="error">{discountPercent}% OFF</Badge>}
        </div>

        {/* Quick Actions */}
        <div className="product-card-featured__quick-actions">
          {showWishlist && (
            <Button
              variant="ghost"
              size="sm"
              className="product-card-featured__wishlist"
              aria-label="Add to wishlist"
            >
              ♥
            </Button>
          )}
        </div>
      </div>

      <div className="product-card-featured__content">
        {/* Category/Brand */}
        {(product.category || product.brand) && (
          <Text
            size="sm"
            color="secondary"
            className="product-card-featured__meta"
          >
            {product.category?.name || product.brand?.name}
          </Text>
        )}

        {/* Product Name */}
        {LinkComponent ? (
          <LinkComponent to={`/products/${product.slug}`}>
            <Text
              size="lg"
              weight="bold"
              className="product-card-featured__name"
            >
              {product.name}
            </Text>
          </LinkComponent>
        ) : (
          <a
            href={`/products/${product.slug}`}
            className="product-card-featured__name-link"
          >
            <Text
              size="lg"
              weight="bold"
              className="product-card-featured__name"
            >
              {product.name}
            </Text>
          </a>
        )}

        {/* Short Description */}
        {product.shortDescription && (
          <Text
            size="sm"
            color="secondary"
            className="product-card-featured__description"
          >
            {product.shortDescription}
          </Text>
        )}

        {/* Price */}
        <div className="product-card-featured__price">
          <Text
            size="xl"
            weight="bold"
            className="product-card-featured__current-price"
          >
            {formatPrice(product.basePrice)}
          </Text>
          {discount && (
            <Text
              size="base"
              color="secondary"
              className="product-card-featured__compare-price"
            >
              {formatPrice(product.compareAtPrice!)}
            </Text>
          )}
        </div>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="product-card-featured__rating">
            <Text size="sm" color="secondary">
              ★ {product.averageRating.toFixed(1)} ({product.reviewCount}{' '}
              reviews)
            </Text>
          </div>
        )}

        {/* Add to Cart Button */}
        {showAddToCart && !isOutOfStock && (
          <Button
            variant="primary"
            size="md"
            className="product-card-featured__add-to-cart"
            fullWidth
          >
            Add to Cart
          </Button>
        )}

        {isOutOfStock && (
          <Button
            variant="ghost"
            size="md"
            className="product-card-featured__out-of-stock"
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
