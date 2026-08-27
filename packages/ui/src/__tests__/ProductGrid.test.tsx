/**
 * ProductGrid Component Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { Product } from '@nabome/types';

import { ProductGrid } from '../ProductGrid';

describe('ProductGrid', () => {
  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'Product 1',
      slug: 'product-1',
      shortDescription: 'Description 1',
      basePrice: { amount: '1000', currency: 'INR' },
      isActive: true,
      status: 'published',
      isNew: false,
      isFeatured: false,
      isTrending: false,
      averageRating: 4,
      reviewCount: 5,
      totalSold: 10,
      gender: 'unisex',
      tags: [],
      categoryId: 'cat-1',
      shopId: 'shop-1',
      sortOrder: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'prod-2',
      name: 'Product 2',
      slug: 'product-2',
      shortDescription: 'Description 2',
      basePrice: { amount: '2000', currency: 'INR' },
      isActive: true,
      status: 'published',
      isNew: false,
      isFeatured: false,
      isTrending: false,
      averageRating: 3.5,
      reviewCount: 3,
      totalSold: 5,
      gender: 'unisex',
      tags: [],
      categoryId: 'cat-1',
      shopId: 'shop-1',
      sortOrder: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('should render products in grid', () => {
    render(
      <ProductGrid
        products={mockProducts}
        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
        gap="md"
      >
        {(product) => <div>{product.name}</div>}
      </ProductGrid>,
    );
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    const { container } = render(
      <ProductGrid
        products={[]}
        loading={true}
        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
        gap="md"
      >
        {(product) => <div>{product.name}</div>}
      </ProductGrid>,
    );
    expect(
      container.querySelector('.product-grid--loading'),
    ).toBeInTheDocument();
  });

  it('should render empty state when no products', () => {
    render(
      <ProductGrid
        products={[]}
        loading={false}
        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
        gap="md"
      >
        {(product) => <div>{product.name}</div>}
      </ProductGrid>,
    );
    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('should render custom empty state', () => {
    render(
      <ProductGrid
        products={[]}
        loading={false}
        columns={{ mobile: 2, tablet: 3, desktop: 4 }}
        gap="md"
        emptyState={<div>Custom empty message</div>}
      >
        {(product) => <div>{product.name}</div>}
      </ProductGrid>,
    );
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });
});
