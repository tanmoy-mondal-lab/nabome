/**
 * Product List Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays products in a vertical list format with more details per product.
 * Used for product listings where users want to see more information per item.
 */

import type { Product } from '@nabome/types';

import { Stack } from './index';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: (product: Product, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export function ProductList({
  products,
  loading = false,
  gap = 'md',
  children,
  emptyState,
}: ProductListProps) {
  if (loading) {
    return (
      <Stack gap={gap} className="product-list product-list--loading">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="product-list__skeleton-item">
            {/* Skeleton placeholder */}
            <div className="product-list__skeleton" />
          </div>
        ))}
      </Stack>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-list product-list--empty">
        {emptyState || (
          <div className="product-list__empty-state">
            <p className="product-list__empty-text">No products found</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Stack gap={gap} className="product-list">
      {products.map((product, index) => (
        <div key={product.id} className="product-list__item">
          {children(product, index)}
        </div>
      ))}
    </Stack>
  );
}
