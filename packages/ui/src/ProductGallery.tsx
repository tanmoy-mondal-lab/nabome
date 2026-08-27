/**
 * Product Gallery Component
 * Source: CATALOG_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md (binding)
 *
 * Displays product images in a gallery with thumbnails and zoom functionality.
 * Used on product detail pages to showcase product media.
 */

import { useState } from 'react';

import type { ProductMedia } from '@nabome/types';

import { Button, Image } from './index';

interface ProductGalleryProps {
  media: ProductMedia[];
  className?: string;
}

export function ProductGallery({ media, className = '' }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className={`product-gallery product-gallery--empty ${className}`}>
        <div className="product-gallery__placeholder">
          <p className="product-gallery__placeholder-text">
            No images available
          </p>
        </div>
      </div>
    );
  }

  const selectedMedia = media[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className={`product-gallery ${className}`}>
      {/* Main Image */}
      <div className="product-gallery__main">
        {selectedMedia && (
          <Image
            src={selectedMedia.url}
            alt={selectedMedia.altText || 'Product image'}
            className="product-gallery__image"
          />
        )}

        {/* Navigation Arrows */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="product-gallery__nav product-gallery__nav--prev"
              aria-label="Previous image"
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="product-gallery__nav product-gallery__nav--next"
              aria-label="Next image"
            >
              →
            </Button>
          </>
        )}

        {/* Image Counter */}
        {media.length > 1 && (
          <div className="product-gallery__counter">
            {selectedIndex + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="product-gallery__thumbnails">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleThumbnailClick(index)}
              className={`product-gallery__thumbnail ${
                index === selectedIndex
                  ? 'product-gallery__thumbnail--active'
                  : ''
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={item.url}
                alt={item.altText || `Thumbnail ${index + 1}`}
                className="product-gallery__thumbnail-image"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
