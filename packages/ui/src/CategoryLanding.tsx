/**
 * Category Landing Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays a category landing page with banner, description, and featured products.
 * Used as the hero section for category pages.
 */

import type { Category, Product } from '@nabome/types';

import { Heading, Text, Image, Button } from './index';

interface CategoryLandingProps {
  category: Category;
  featuredProducts?: Product[];
  onShopNow?: () => void;
  className?: string;
}

export function CategoryLanding({
  category,
  featuredProducts = [],
  onShopNow,
  className = '',
}: CategoryLandingProps) {
  return (
    <div className={`category-landing ${className}`}>
      {/* Banner */}
      {category.banner && (
        <div className="category-landing__banner">
          <Image
            src={category.banner}
            alt={category.name}
            className="category-landing__banner-image"
          />
        </div>
      )}

      {/* Content */}
      <div className="category-landing__content">
        <Heading level="h1" className="category-landing__title">
          {category.name}
        </Heading>

        {category.description && (
          <Text
            size="lg"
            color="secondary"
            className="category-landing__description"
          >
            {category.description}
          </Text>
        )}

        {onShopNow && (
          <Button
            variant="primary"
            size="md"
            onClick={onShopNow}
            className="category-landing__cta"
          >
            Shop Now
          </Button>
        )}

        {/* Featured Products Preview */}
        {featuredProducts.length > 0 && (
          <div className="category-landing__featured">
            <Text
              size="sm"
              weight="semibold"
              className="category-landing__featured-label"
            >
              Featured Products
            </Text>
            <div className="category-landing__featured-count">
              <Text size="sm" color="secondary">
                {featuredProducts.length} products available
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
