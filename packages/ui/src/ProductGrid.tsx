/**
 * Product Grid Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays products in a responsive grid layout. Used for product listings,
 * category pages, collection pages, and search results.
 */

import type { Product } from '@nabome/types';

import { Grid } from './index';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  columns?: {
    mobile?: 1 | 2 | 3 | 4;
    tablet?: 1 | 2 | 3 | 4;
    desktop?: 1 | 2 | 3 | 4;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: (product: Product, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
}

export function ProductGrid({
  products,
  loading = false,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  gap = 'md',
  children,
  emptyState,
}: ProductGridProps) {
  if (loading) {
    return (
      <Grid
        cols={columns.mobile}
        colsSm={columns.tablet}
        colsMd={columns.desktop}
        gap={gap}
        className="product-grid product-grid--loading"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="product-grid__skeleton-item">
            {/* Skeleton placeholder */}
            <div className="product-grid__skeleton" />
          </div>
        ))}
      </Grid>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid product-grid--empty">
        {emptyState || (
          <div className="product-grid__empty-state">
            <p className="product-grid__empty-text">No products found</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Grid
      cols={columns.mobile}
      colsSm={columns.tablet}
      colsMd={columns.desktop}
      gap={gap}
      className="product-grid"
    >
      {products.map((product, index) => (
        <div key={product.id} className="product-grid__item">
          {children(product, index)}
        </div>
      ))}
    </Grid>
  );
}
