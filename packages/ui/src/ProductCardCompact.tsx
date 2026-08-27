/**
 * Compact Product Card Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays product information in a compact card format with smaller image
 * and minimal details. Used in tight spaces, sidebars, and dense grids.
 */

import type { Product } from '@nabome/types';

import { Card, Button, Badge, Text, Image } from './index';

interface ProductCardCompactProps {
  product: Product;
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

export function ProductCardCompact({
  product,
  showAddToCart = true,
  className = '',
  linkComponent: LinkComponent,
}: ProductCardCompactProps) {
  const primaryImage = getPrimaryImage(product);
  const discount = hasDiscount(product);

  const isOutOfStock = product.variants?.every(
    (v) => v.availableStock - v.reservedStock <= 0,
  );

  return (
    <Card className={`product-card-compact ${className}`}>
      <div className="product-card-compact__content">
        {/* Image */}
        <div className="product-card-compact__image-wrapper">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              className="product-card-compact__image"
              loading="lazy"
            />
          ) : (
            <div className="product-card-compact__image-placeholder" />
          )}
        </div>

        {/* Details */}
        <div className="product-card-compact__details">
          {/* Product Name */}
          {LinkComponent ? (
            <LinkComponent to={`/products/${product.slug}`}>
              <Text
                size="sm"
                weight="semibold"
                className="product-card-compact__name"
              >
                {product.name}
              </Text>
            </LinkComponent>
          ) : (
            <a
              href={`/products/${product.slug}`}
              className="product-card-compact__name-link"
            >
              <Text
                size="sm"
                weight="semibold"
                className="product-card-compact__name"
              >
                {product.name}
              </Text>
            </a>
          )}

          {/* Price */}
          <div className="product-card-compact__price">
            <Text
              size="base"
              weight="bold"
              className="product-card-compact__current-price"
            >
              {formatPrice(product.basePrice)}
            </Text>
            {discount && (
              <Text
                size="xs"
                color="secondary"
                className="product-card-compact__compare-price"
              >
                {formatPrice(product.compareAtPrice!)}
              </Text>
            )}
          </div>

          {/* Badges */}
          <div className="product-card-compact__badges">
            {product.isNew && <Badge variant="success">New</Badge>}
            {isOutOfStock && <Badge variant="neutral">Out of Stock</Badge>}
          </div>
        </div>

        {/* Add to Cart */}
        {showAddToCart && !isOutOfStock && (
          <Button
            variant="primary"
            size="sm"
            className="product-card-compact__add-to-cart"
          >
            Add
          </Button>
        )}
      </div>
    </Card>
  );
}
