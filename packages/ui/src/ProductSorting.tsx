/**
 * Product Sorting Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Provides sorting options for product listings including price, name,
 * rating, popularity, and date. Used in product listing pages.
 */

import { Select } from './index';

export type ProductSortOption =
  | 'createdAt-desc'
  | 'createdAt-asc'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'rating-asc'
  | 'name-asc'
  | 'name-desc'
  | 'popularity-desc'
  | 'sortOrder-asc';

interface ProductSortingProps {
  value: ProductSortOption;
  onChange: (value: ProductSortOption) => void;
  options?: ProductSortOption[];
  className?: string;
}

const SORT_LABELS: Record<ProductSortOption, string> = {
  'createdAt-desc': 'Newest First',
  'createdAt-asc': 'Oldest First',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'rating-desc': 'Highest Rated',
  'rating-asc': 'Lowest Rated',
  'name-asc': 'Name: A to Z',
  'name-desc': 'Name: Z to A',
  'popularity-desc': 'Most Popular',
  'sortOrder-asc': 'Featured',
};

const DEFAULT_SORT_OPTIONS: ProductSortOption[] = [
  'createdAt-desc',
  'price-asc',
  'price-desc',
  'rating-desc',
  'name-asc',
  'popularity-desc',
];

export function ProductSorting({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  className = '',
}: ProductSortingProps) {
  const selectOptions = options.map((option) => ({
    value: option,
    label: SORT_LABELS[value],
  }));

  return (
    <div className={`product-sorting ${className}`}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as ProductSortOption)}
        options={selectOptions}
        label="Sort by"
        className="product-sorting__select"
      />
    </div>
  );
}
