/**
 * Product Variants Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays product variant selection (size, color, etc.) with stock indicators.
 * Used on product detail pages for variant selection.
 */

import { useState } from 'react';

import type { ProductVariant } from '@nabome/types';

import { Badge, Text } from './index';

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onVariantSelect: (variantId: string) => void;
  className?: string;
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
 * Get inventory status label
 */
function getInventoryStatus(variant: ProductVariant): string {
  const available = variant.availableStock - variant.reservedStock;
  if (available <= 0) return 'Out of Stock';
  if (available <= variant.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
}

/**
 * Get inventory status color
 */
function getInventoryStatusColor(
  variant: ProductVariant,
): 'success' | 'warning' | 'error' {
  const available = variant.availableStock - variant.reservedStock;
  if (available <= 0) return 'error';
  if (available <= variant.lowStockThreshold) return 'warning';
  return 'success';
}

export function ProductVariants({
  variants,
  selectedVariantId,
  onVariantSelect,
  className = '',
}: ProductVariantsProps) {
  const [selectedId, setSelectedId] = useState(
    selectedVariantId || variants[0]?.id,
  );

  const handleVariantSelect = (variantId: string) => {
    setSelectedId(variantId);
    onVariantSelect(variantId);
  };

  if (variants.length === 0) {
    return null;
  }

  const selectedVariant =
    variants.find((v) => v.id === selectedId) || variants[0];

  return (
    <div className={`product-variants ${className}`}>
      <div className="product-variants__header">
        <Text size="sm" weight="semibold">
          Select Variant
        </Text>
        {selectedVariant && (
          <Badge variant={getInventoryStatusColor(selectedVariant)}>
            {getInventoryStatus(selectedVariant)}
          </Badge>
        )}
      </div>

      <div className="product-variants__list">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const isOutOfStock =
            variant.availableStock - variant.reservedStock <= 0;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && handleVariantSelect(variant.id)}
              disabled={isOutOfStock}
              className={`product-variants__option ${
                isSelected ? 'product-variants__option--selected' : ''
              } ${isOutOfStock ? 'product-variants__option--disabled' : ''}`}
              aria-label={`Select ${variant.name}`}
            >
              <div className="product-variants__option-content">
                <Text size="sm" weight={isSelected ? 'semibold' : 'regular'}>
                  {variant.name}
                </Text>
                <Text size="xs" color="secondary">
                  {formatPrice(variant.price)}
                </Text>
              </div>
              {isOutOfStock && (
                <Text size="xs" color="tertiary">
                  Sold Out
                </Text>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Variant Details */}
      {selectedVariant && (
        <div className="product-variants__details">
          <Text size="sm" color="secondary">
            SKU: {selectedVariant.sku}
          </Text>
          {selectedVariant.attributes &&
            Object.keys(selectedVariant.attributes).length > 0 && (
              <div className="product-variants__attributes">
                {Object.entries(selectedVariant.attributes).map(
                  ([key, value]) => (
                    <Text key={key} size="xs" color="secondary">
                      {key}: {String(value)}
                    </Text>
                  ),
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
