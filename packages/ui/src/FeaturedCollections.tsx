/**
 * Featured Collections Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays featured collections in a grid or carousel layout. Used on
 * homepage and collection listing pages.
 */

import type { Collection } from '@nabome/types';

import { Grid, Heading, Text } from './index';

interface FeaturedCollectionsProps {
  collections: Collection[];
  loading?: boolean;
  columns?: {
    mobile?: 1 | 2 | 3 | 4;
    tablet?: 1 | 2 | 3 | 4;
    desktop?: 1 | 2 | 3 | 4;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onCollectionClick?: (collection: Collection) => void;
  className?: string;
}

export function FeaturedCollections({
  collections,
  loading = false,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  onCollectionClick,
  className = '',
}: FeaturedCollectionsProps) {
  if (loading) {
    return (
      <div
        className={`featured-collections featured-collections--loading ${className}`}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="featured-collections__skeleton-item">
            <div className="featured-collections__skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div
        className={`featured-collections featured-collections--empty ${className}`}
      >
        <p className="featured-collections__empty-text">
          No collections available
        </p>
      </div>
    );
  }

  return (
    <div className={`featured-collections ${className}`}>
      <Heading level="h3" className="featured-collections__title">
        Featured Collections
      </Heading>

      <Grid
        cols={columns.mobile}
        colsSm={columns.tablet}
        colsMd={columns.desktop}
        gap={gap}
        className="featured-collections__grid"
      >
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="featured-collections__item"
            onClick={() => onCollectionClick?.(collection)}
          >
            <div className="featured-collections__card">
              {collection.imageUrl && (
                <div className="featured-collections__image-wrapper">
                  <img
                    src={collection.imageUrl}
                    alt={collection.name}
                    className="featured-collections__image"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="featured-collections__content">
                <Text
                  size="base"
                  weight="semibold"
                  className="featured-collections__name"
                >
                  {collection.name}
                </Text>
                {collection.description && (
                  <Text
                    size="sm"
                    color="secondary"
                    className="featured-collections__description"
                  >
                    {collection.description}
                  </Text>
                )}
              </div>
            </div>
          </div>
        ))}
      </Grid>
    </div>
  );
}
