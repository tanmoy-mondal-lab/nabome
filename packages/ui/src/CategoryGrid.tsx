/**
 * Category Grid Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays categories in a grid layout with images and names. Used on
 * homepage, category listing pages, and navigation menus.
 */

import type { Category } from '@nabome/types';

import { Card, Text, Image } from './index';

interface CategoryGridProps {
  categories: Category[];
  loading?: boolean;
  columns?: {
    mobile?: 1 | 2 | 3 | 4;
    tablet?: 1 | 2 | 3 | 4;
    desktop?: 1 | 2 | 3 | 4;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onCategoryClick?: (category: Category) => void;
  className?: string;
}

export function CategoryGrid({
  categories,
  loading = false,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  gap = 'md',
  onCategoryClick,
  className = '',
}: CategoryGridProps) {
  const handleCategoryClick = (category: Category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  if (loading) {
    return (
      <div className={`category-grid category-grid--loading ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="category-grid__skeleton-item">
            <div className="category-grid__skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={`category-grid category-grid--empty ${className}`}>
        <p className="category-grid__empty-text">No categories found</p>
      </div>
    );
  }

  return (
    <div
      className={`category-grid category-grid--cols-${columns.mobile} category-grid--cols-sm-${columns.tablet} category-grid--cols-md-${columns.desktop} category-grid--gap-${gap} ${className}`}
    >
      {categories.map((category) => (
        <div key={category.id} className="category-grid__item">
          <Card
            className="category-grid__card"
            onClick={() => handleCategoryClick(category)}
          >
            {/* Category Image */}
            {category.iconUrl || category.banner ? (
              <div className="category-grid__image-wrapper">
                <Image
                  src={category.iconUrl || category.banner!}
                  alt={category.name}
                  className="category-grid__image"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="category-grid__image-placeholder">
                <Text size="xl" weight="bold" color="tertiary">
                  {category.name.charAt(0)}
                </Text>
              </div>
            )}

            {/* Category Name */}
            <div className="category-grid__content">
              <Text
                size="base"
                weight="semibold"
                className="category-grid__name"
              >
                {category.name}
              </Text>
              {category.description && (
                <Text
                  size="sm"
                  color="secondary"
                  className="category-grid__description"
                >
                  {category.description}
                </Text>
              )}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
