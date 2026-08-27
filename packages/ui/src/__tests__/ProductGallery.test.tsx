/**
 * ProductGallery Component Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import type { ProductMedia } from '@nabome/types';

import { ProductGallery } from '../ProductGallery';

describe('ProductGallery', () => {
  const mockMedia: ProductMedia[] = [
    {
      id: 'media-1',
      productId: 'prod-1',
      url: 'https://example.com/image1.jpg',
      altText: 'Product Image 1',
      type: 'image',
      sortOrder: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'media-2',
      productId: 'prod-1',
      url: 'https://example.com/image2.jpg',
      altText: 'Product Image 2',
      type: 'image',
      sortOrder: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('should render main image', () => {
    render(<ProductGallery media={mockMedia} />);
    const mainImage = screen.getAllByAltText('Product Image 1')[0];
    expect(mainImage).toBeInTheDocument();
  });

  it('should render thumbnails when multiple images', () => {
    render(<ProductGallery media={mockMedia} />);
    expect(
      screen.getAllByAltText('Product Image 1').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByAltText('Product Image 2').length,
    ).toBeGreaterThanOrEqual(1);
  });

  it('should render empty state when no media', () => {
    render(<ProductGallery media={[]} />);
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('should render image counter', () => {
    render(<ProductGallery media={mockMedia} />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('should render navigation arrows when multiple images', () => {
    render(<ProductGallery media={mockMedia} />);
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
  });
});
