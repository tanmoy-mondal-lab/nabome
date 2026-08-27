/**
 * Product Filters Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Provides filtering options for product listings including price range,
 * categories, brands, and other attributes. Used in product listing pages.
 */

import { useState } from 'react';

import { Button, Checkbox, Stack, Text, Heading } from './index';

export interface ProductFiltersState {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
}

interface ProductFiltersProps {
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    productCount?: number;
  }>;
  brands?: Array<{
    id: string;
    name: string;
    slug: string;
    productCount?: number;
  }>;
  maxPrice?: number;
  onFiltersChange: (filters: ProductFiltersState) => void;
  initialFilters?: Partial<ProductFiltersState>;
  className?: string;
}

export function ProductFilters({
  categories = [],
  brands = [],
  maxPrice = 100000,
  onFiltersChange,
  initialFilters = {},
  className = '',
}: ProductFiltersProps) {
  const [filters, setFilters] = useState<ProductFiltersState>({
    categories: initialFilters.categories || [],
    brands: initialFilters.brands || [],
    priceRange: initialFilters.priceRange || { min: 0, max: maxPrice },
    inStock: initialFilters.inStock || false,
    isNew: initialFilters.isNew || false,
    isFeatured: initialFilters.isFeatured || false,
  });

  const [priceMin, setPriceMin] = useState(filters.priceRange.min);
  const [priceMax, setPriceMax] = useState(filters.priceRange.max);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];

    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleBrandToggle = (brandId: string) => {
    const newBrands = filters.brands.includes(brandId)
      ? filters.brands.filter((id) => id !== brandId)
      : [...filters.brands, brandId];

    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = () => {
    const newFilters = {
      ...filters,
      priceRange: { min: priceMin, max: priceMax },
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleToggleChange = (key: keyof ProductFiltersState) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters: ProductFiltersState = {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: maxPrice },
      inStock: false,
      isNew: false,
      isFeatured: false,
    };
    setFilters(clearedFilters);
    setPriceMin(0);
    setPriceMax(maxPrice);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < maxPrice ||
    filters.inStock ||
    filters.isNew ||
    filters.isFeatured;

  return (
    <div className={`product-filters ${className}`}>
      <div className="product-filters__header">
        <Heading level="h5">Filters</Heading>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="product-filters__clear"
          >
            Clear All
          </Button>
        )}
      </div>

      <Stack gap="lg" className="product-filters__content">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="product-filters__section">
            <Text
              size="sm"
              weight="semibold"
              className="product-filters__section-title"
            >
              Categories
            </Text>
            <Stack gap="xs" className="product-filters__options">
              {categories.map((category) => (
                <label key={category.id} className="product-filters__option">
                  <Checkbox
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  <span className="product-filters__option-label">
                    {category.name}
                    {category.productCount !== undefined && (
                      <span className="product-filters__option-count">
                        ({category.productCount})
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </Stack>
          </div>
        )}

        {/* Brands */}
        {brands.length > 0 && (
          <div className="product-filters__section">
            <Text
              size="sm"
              weight="semibold"
              className="product-filters__section-title"
            >
              Brands
            </Text>
            <Stack gap="xs" className="product-filters__options">
              {brands.map((brand) => (
                <label key={brand.id} className="product-filters__option">
                  <Checkbox
                    checked={filters.brands.includes(brand.id)}
                    onChange={() => handleBrandToggle(brand.id)}
                  />
                  <span className="product-filters__option-label">
                    {brand.name}
                    {brand.productCount !== undefined && (
                      <span className="product-filters__option-count">
                        ({brand.productCount})
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </Stack>
          </div>
        )}

        {/* Price Range */}
        <div className="product-filters__section">
          <Text
            size="sm"
            weight="semibold"
            className="product-filters__section-title"
          >
            Price Range
          </Text>
          <div className="product-filters__price-range">
            <input
              type="number"
              min={0}
              max={maxPrice}
              value={priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              onBlur={handlePriceRangeChange}
              className="product-filters__price-input"
              placeholder="Min"
            />
            <span className="product-filters__price-separator">-</span>
            <input
              type="number"
              min={0}
              max={maxPrice}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              onBlur={handlePriceRangeChange}
              className="product-filters__price-input"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="product-filters__section">
          <Text
            size="sm"
            weight="semibold"
            className="product-filters__section-title"
          >
            Availability
          </Text>
          <Stack gap="xs" className="product-filters__options">
            <label className="product-filters__option">
              <Checkbox
                checked={filters.inStock}
                onChange={() => handleToggleChange('inStock')}
              />
              <span className="product-filters__option-label">In Stock</span>
            </label>
            <label className="product-filters__option">
              <Checkbox
                checked={filters.isNew}
                onChange={() => handleToggleChange('isNew')}
              />
              <span className="product-filters__option-label">
                New Arrivals
              </span>
            </label>
            <label className="product-filters__option">
              <Checkbox
                checked={filters.isFeatured}
                onChange={() => handleToggleChange('isFeatured')}
              />
              <span className="product-filters__option-label">Featured</span>
            </label>
          </Stack>
        </div>
      </Stack>
    </div>
  );
}
