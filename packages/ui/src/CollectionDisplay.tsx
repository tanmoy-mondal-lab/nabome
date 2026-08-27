/**
 * Collection Display Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays a collection with its products in a visually appealing layout.
 * Used on collection pages and homepage sections.
 */

import type { Collection, Product } from '@nabome/types';

import { Heading, Text, Image, Button } from './index';

interface CollectionDisplayProps {
  collection: Collection;
  products?: Product[];
  onViewAll?: () => void;
  onProductClick?: (product: Product) => void;
  className?: string;
}

/**
 * Format date range for display
 */
function formatDateRange(
  startsAt?: string | null,
  endsAt?: string | null,
): string {
  if (!startsAt && !endsAt) return '';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (startsAt && endsAt) {
    return `${formatDate(startsAt)} - ${formatDate(endsAt)}`;
  }

  if (startsAt) {
    return `From ${formatDate(startsAt)}`;
  }

  if (endsAt) {
    return `Until ${formatDate(endsAt)}`;
  }

  return '';
}

export function CollectionDisplay({
  collection,
  products = [],
  onViewAll,
  onProductClick,
  className = '',
}: CollectionDisplayProps) {
  const dateRange = formatDateRange(collection.startsAt, collection.endsAt);
  const displayProducts = products.slice(0, 4);

  return (
    <div className={`collection-display ${className}`}>
      {/* Collection Header */}
      <div className="collection-display__header">
        {collection.imageUrl && (
          <div className="collection-display__image-wrapper">
            <Image
              src={collection.imageUrl}
              alt={collection.name}
              className="collection-display__image"
            />
          </div>
        )}

        <div className="collection-display__info">
          <Heading level="h3" className="collection-display__title">
            {collection.name}
          </Heading>

          {collection.description && (
            <Text
              size="sm"
              color="secondary"
              className="collection-display__description"
            >
              {collection.description}
            </Text>
          )}

          {dateRange && (
            <Text
              size="xs"
              color="tertiary"
              className="collection-display__date-range"
            >
              {dateRange}
            </Text>
          )}

          {collection.type && (
            <Text size="xs" color="brand" className="collection-display__type">
              {collection.type.charAt(0).toUpperCase() +
                collection.type.slice(1)}{' '}
              Collection
            </Text>
          )}
        </div>
      </div>

      {/* Products Preview */}
      {displayProducts.length > 0 && (
        <div className="collection-display__products">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="collection-display__product"
              onClick={() => onProductClick?.(product)}
            >
              {product.media && product.media[0] && (
                <Image
                  src={product.media[0].url}
                  alt={product.name}
                  className="collection-display__product-image"
                />
              )}
              <Text
                size="sm"
                weight="medium"
                className="collection-display__product-name"
              >
                {product.name}
              </Text>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {onViewAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAll}
          className="collection-display__view-all"
        >
          View All Products
        </Button>
      )}
    </div>
  );
}
