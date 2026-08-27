/**
 * ProductCard Component Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { Product } from '@nabome/types';

import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Test Product',
    slug: 'test-product',
    shortDescription: 'A test product',
    basePrice: { amount: '1000', currency: 'INR' },
    compareAtPrice: { amount: '1500', currency: 'INR' },
    isActive: true,
    status: 'published',
    isNew: true,
    isFeatured: false,
    isTrending: false,
    averageRating: 4.5,
    reviewCount: 10,
    totalSold: 100,
    gender: 'unisex',
    tags: [],
    categoryId: 'cat-1',
    shopId: 'shop-1',
    sortOrder: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('should render product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render product price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/₹1,000/)).toBeInTheDocument();
  });

  it('should render discount badge when compareAtPrice is higher', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/33%/)).toBeInTheDocument();
  });

  it('should render new badge when isNew is true', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should render rating', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
  });

  it('should render add to cart button', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('should render out of stock button when product has no stock', () => {
    const outOfStockProduct = {
      ...mockProduct,
      variants: [{ id: 'var-1', availableStock: 0, reservedStock: 0 } as any],
    };
    render(<ProductCard product={outOfStockProduct} />);
    expect(
      screen.getByRole('button', { name: /Out of Stock/i }),
    ).toBeInTheDocument();
  });
});
