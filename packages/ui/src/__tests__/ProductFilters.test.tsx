/**
 * ProductFilters Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ProductFilters } from '../ProductFilters';

describe('ProductFilters', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Electronics', slug: 'electronics', productCount: 10 },
    { id: 'cat-2', name: 'Clothing', slug: 'clothing', productCount: 5 },
  ];

  const mockBrands = [
    { id: 'brand-1', name: 'Brand A', slug: 'brand-a', productCount: 8 },
    { id: 'brand-2', name: 'Brand B', slug: 'brand-b', productCount: 7 },
  ];

  it('should render filter title', () => {
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        maxPrice={100000}
        onFiltersChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should render categories section', () => {
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        maxPrice={100000}
        onFiltersChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('should render brands section', () => {
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        maxPrice={100000}
        onFiltersChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Brands')).toBeInTheDocument();
    expect(screen.getByText('Brand A')).toBeInTheDocument();
    expect(screen.getByText('Brand B')).toBeInTheDocument();
  });

  it('should render price range section', () => {
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        maxPrice={100000}
        onFiltersChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Price Range')).toBeInTheDocument();
  });

  it('should render availability filters', () => {
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        maxPrice={100000}
        onFiltersChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Availability')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('should call onFiltersChange when category is selected', () => {
    const onFiltersChange = vi.fn();
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        maxPrice={100000}
        onFiltersChange={onFiltersChange}
      />,
    );

    const categoryCheckbox = screen.getByText('Electronics').closest('label');
    if (categoryCheckbox) {
      fireEvent.click(categoryCheckbox);
    }
    expect(onFiltersChange).toHaveBeenCalled();
  });

  it('should call onFiltersChange when brand is selected', () => {
    const onFiltersChange = vi.fn();
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        maxPrice={100000}
        onFiltersChange={onFiltersChange}
      />,
    );

    const brandCheckbox = screen.getByText('Brand A').closest('label');
    if (brandCheckbox) {
      fireEvent.click(brandCheckbox);
    }
    expect(onFiltersChange).toHaveBeenCalled();
  });

  it('should show clear all button when filters are active', () => {
    const onFiltersChange = vi.fn();
    render(
      <ProductFilters
        categories={mockCategories}
        brands={mockBrands}
        maxPrice={100000}
        onFiltersChange={onFiltersChange}
        initialFilters={{ inStock: true }}
      />,
    );
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });
});
