/**
 * ProductSectionBase — base component for product sections (HOMEPAGE_BUILDER_ARCHITECTURE §6.2)
 * Shared rendering logic for all product sections (Featured, Trending, Best Sellers, New Arrivals).
 * This component is reused by specific product section types.
 */

import { Container } from '@nabome/ui';
import { Heading } from '@nabome/ui';
import { Text } from '@nabome/ui';
import { Link } from '@nabome/ui';
import { Card } from '@nabome/ui';
import { Image } from '@nabome/ui';
import { Badge } from '@nabome/ui';
import { Grid } from '@nabome/ui';

import { WishlistButton } from '@/features/wishlist/WishlistButton';

import type { ProductSectionConfig } from '../types';

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductSectionBaseProps {
  id: string;
  config: ProductSectionConfig;
  sectionType: string;
}

export function ProductSectionBase({
  id,
  config,
  sectionType,
}: ProductSectionBaseProps) {
  const {
    products,
    title,
    description,
    cta,
    layout = 'grid',
    columns = { mobile: 2, tablet: 3, desktop: 4 },
    maxItems,
  } = config;

  // Limit products if maxItems is specified
  const displayProducts = maxItems ? products.slice(0, maxItems) : products;

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      className="w-full py-12 sm:py-16 lg:py-20"
      aria-labelledby={`${id}-title`}
    >
      <Container size="default" padding="lg">
        {/* Section Header */}
        {(title || description) && (
          <div className="mb-8 text-center sm:mb-12">
            {title && (
              <Heading
                id={`${id}-title`}
                level="h2"
                className="mb-4 text-3xl font-bold sm:text-4xl"
              >
                {title}
              </Heading>
            )}
            {description && (
              <Text
                size="lg"
                className="mx-auto max-w-2xl text-(--text-secondary)"
              >
                {description}
              </Text>
            )}
          </div>
        )}

        {/* Products Grid */}
        {layout === 'grid' && (
          <Grid
            cols={(columns.mobile ?? 2) as 1 | 2 | 3 | 4 | 6 | 12}
            colsSm={(columns.tablet ?? 3) as 1 | 2 | 3 | 4 | 6 | 8 | 12}
            colsLg={(columns.desktop ?? 4) as 1 | 2 | 3 | 4 | 6 | 8 | 12}
            gap="md"
          >
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sectionType={sectionType}
              />
            ))}
          </Grid>
        )}

        {/* Products Carousel (horizontal scroll on mobile) */}
        {layout === 'carousel' && (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-auto"
              >
                <ProductCard product={product} sectionType={sectionType} />
              </div>
            ))}
          </div>
        )}

        {/* Products List */}
        {layout === 'list' && (
          <div className="space-y-4">
            {displayProducts.map((product) => (
              <ProductListItem
                key={product.id}
                product={product}
                sectionType={sectionType}
              />
            ))}
          </div>
        )}

        {/* CTA Button */}
        {cta && (
          <div className="mt-8 text-center sm:mt-12">
            <Link
              href={cta.url}
              external={cta.openInNewTab}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1 bg-(--button-primary-bg) text-(--button-primary-text) hover:bg-(--button-primary-bg-hover) active:bg-(--button-primary-bg-active) h-10 px-4 text-base"
            >
              {cta.text}
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}

/**
 * Product Card Component
 */
function ProductCard({
  product,
  sectionType,
}: {
  product: Product;
  sectionType: string;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      onClick={() => handleProductClick(product.id, product.name, sectionType)}
    >
      <Card className="h-full overflow-hidden transition-shadow duration-(--duration-fast) group-hover:shadow-lg">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-(--color-neutral-100)">
          <Image
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-(--duration-medium) group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <Badge variant="brand" className="absolute left-3 top-3">
              {product.badge}
            </Badge>
          )}
          <div className="absolute right-3 top-3">
            <WishlistButton productId={product.id} size="md" />
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <Text
            size="base"
            weight="medium"
            className="mb-2 line-clamp-2 text-(--text-primary)"
          >
            {product.name}
          </Text>

          {/* Rating */}
          {product.rating && (
            <div className="mb-2 flex items-center gap-1">
              <Text size="sm" className="text-(--color-accent-gold)">
                ★
              </Text>
              <Text size="sm" className="text-(--text-secondary)">
                {product.rating.toFixed(1)}
                {product.reviewCount && (
                  <span className="ml-1">({product.reviewCount})</span>
                )}
              </Text>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <Text size="lg" weight="semibold" className="text-(--text-primary)">
              ₹{product.price.toLocaleString()}
            </Text>
            {product.compareAtPrice && (
              <Text size="sm" className="line-through text-(--text-secondary)">
                ₹{product.compareAtPrice.toLocaleString()}
              </Text>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Product List Item Component
 */
function ProductListItem({
  product,
  sectionType,
}: {
  product: Product;
  sectionType: string;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      onClick={() => handleProductClick(product.id, product.name, sectionType)}
    >
      <Card className="flex gap-4 p-4 transition-shadow duration-(--duration-fast) group-hover:shadow-md">
        {/* Product Image */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-(--color-neutral-100)">
          <Image
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-center">
          <Text
            size="base"
            weight="medium"
            className="mb-1 line-clamp-1 text-(--text-primary)"
          >
            {product.name}
          </Text>

          {/* Rating */}
          {product.rating && (
            <div className="mb-1 flex items-center gap-1">
              <Text size="sm" className="text-(--color-accent-gold)">
                ★
              </Text>
              <Text size="sm" className="text-(--text-secondary)">
                {product.rating.toFixed(1)}
              </Text>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <Text
              size="base"
              weight="semibold"
              className="text-(--text-primary)"
            >
              ₹{product.price.toLocaleString()}
            </Text>
            {product.compareAtPrice && (
              <Text size="sm" className="line-through text-(--text-secondary)">
                ₹{product.compareAtPrice.toLocaleString()}
              </Text>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Handle product click for analytics
 */
function handleProductClick(
  productId: string,
  productName: string,
  sectionType: string,
) {
  // TODO: Integrate with analytics service (PostHog)
  console.warn('Product clicked:', { productId, productName, sectionType });
}
