import { describe, it, expect } from 'vitest';
import {
  canonical,
  ogImageFallback,
  websiteSchema,
  productSchema,
  collectionSchema,
  breadcrumbSchema,
  img,
  imgSet,
} from "@/lib/seo";

describe('canonical', () => {
  it('should prepend site URL to relative path', () => {
    const result = canonical('/products/test');
    expect(result).toContain('নবME.online');
    expect(result).toContain('/products/test');
  });

  it('should strip trailing slashes', () => {
    const result = canonical('/products/test/');
    expect(result).not.toMatch(/\/$/);
  });

  it('should return full URLs as-is', () => {
    const result = canonical('https://example.com/page');
    expect(result).toBe('https://example.com/page');
  });

  it('should handle root path', () => {
    const result = canonical('/');
    expect(result).toContain('নবME.online');
  });
});

describe('ogImageFallback', () => {
  it('should return OG image URL', () => {
    const result = ogImageFallback();
    expect(result).toContain('og-image.jpg');
    expect(result).toContain('নবME.online');
  });
});

describe('websiteSchema', () => {
  it('should return valid schema', () => {
    const schema = websiteSchema();
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBeTruthy();
    expect(schema.url).toBeTruthy();
  });

  it('should include search action', () => {
    const schema = websiteSchema();
    expect(schema.potentialAction).toBeTruthy();
    expect(schema.potentialAction['@type']).toBe('SearchAction');
  });
});

describe('productSchema', () => {
  const baseProduct = {
    name: 'Test Product',
    slug: 'test-product',
    basePrice: 999,
    description: 'A test product',
    images: [{ url: 'https://res.cloudinary.com/test/image/upload/test.jpg' }],
    variants: [
      { sku: 'SKU-001', stock: 10, priceAdjustment: 0 },
    ],
  };

  it('should return valid product schema', () => {
    const schema = productSchema(baseProduct);
    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBe('Test Product');
  });

  it('should include images', () => {
    const schema = productSchema(baseProduct);
    const images = schema.image as string[];
    expect(images.length).toBe(1);
    expect(images[0]).toContain('cloudinary');
  });

  it('should calculate price range from variants', () => {
    const schema = productSchema({
      ...baseProduct,
      variants: [
        { sku: 'SKU-001', stock: 10, priceAdjustment: 0 },
        { sku: 'SKU-002', stock: 5, priceAdjustment: 200 },
      ],
    });
    const offers = schema.offers as Record<string, unknown>;
    expect(offers.lowPrice).toBe(999);
    expect(offers.highPrice).toBe(1199);
  });

  it('should mark in-stock products', () => {
    const schema = productSchema(baseProduct);
    const offers = schema.offers as Record<string, unknown>;
    const offerList = offers.offers as Record<string, unknown>[];
    expect(offerList[0].availability).toBe('https://schema.org/InStock');
  });

  it('should mark out-of-stock products', () => {
    const schema = productSchema({
      ...baseProduct,
      variants: [{ sku: 'SKU-001', stock: 0, priceAdjustment: 0 }],
    });
    const offers = schema.offers as Record<string, unknown>;
    const offerList = offers.offers as Record<string, unknown>[];
    expect(offerList[0].availability).toBe('https://schema.org/OutOfStock');
  });

  it('should include brand when present', () => {
    const schema = productSchema({
      ...baseProduct,
      brand: { name: 'Test Brand' },
    });
    const brand = schema.brand as Record<string, unknown>;
    expect(brand['@type']).toBe('Brand');
    expect(brand.name).toBe('Test Brand');
  });

  it('should handle product without brand', () => {
    const schema = productSchema(baseProduct);
    expect(schema.brand).toBeUndefined();
  });

  it('should handle product without images', () => {
    const schema = productSchema({
      ...baseProduct,
      images: [],
    });
    const images = schema.image as string[];
    expect(images.length).toBe(0);
  });

  it('should handle product without variants', () => {
    const schema = productSchema({
      ...baseProduct,
      variants: [],
    });
    expect(schema['@type']).toBe('Product');
    const offers = schema.offers as Record<string, unknown>;
    expect(offers.offerCount).toBe(0);
  });

  it('should limit offers to 5', () => {
    const variants = Array.from({ length: 10 }, (_, i) => ({
      sku: `SKU-${i}`,
      stock: 10,
      priceAdjustment: i * 100,
    }));
    const schema = productSchema({ ...baseProduct, variants });
    const offers = schema.offers as Record<string, unknown>;
    const offerList = offers.offers as Record<string, unknown>[];
    expect(offerList.length).toBe(5);
  });

  it('should use selected variant SKU when provided', () => {
    const schema = productSchema(baseProduct, { sku: 'SELECTED-SKU' });
    expect(schema.sku).toBe('SELECTED-SKU');
  });

  it('should fallback to first variant SKU', () => {
    const schema = productSchema(baseProduct);
    expect(schema.sku).toBe('SKU-001');
  });

  it('should truncate description to 5000 chars', () => {
    const longDesc = 'x'.repeat(6000);
    const schema = productSchema({ ...baseProduct, description: longDesc });
    expect((schema.description as string).length).toBe(5000);
  });
});

describe('collectionSchema', () => {
  it('should return valid collection schema', () => {
    const schema = collectionSchema({
      name: 'Summer 2024',
      slug: 'summer-2024',
      description: 'Summer collection',
    });
    expect(schema['@type']).toBe('CollectionPage');
    expect(schema.name).toBe('Summer 2024');
  });

  it('should include image when present', () => {
    const schema = collectionSchema({
      name: 'Summer',
      slug: 'summer',
      coverImageUrl: 'https://example.com/cover.jpg',
    });
    expect(schema.image).toBe('https://example.com/cover.jpg');
  });

  it('should not include image when absent', () => {
    const schema = collectionSchema({
      name: 'Summer',
      slug: 'summer',
    });
    expect(schema.image).toBeUndefined();
  });

  it('should include numberOfItems when present', () => {
    const schema = collectionSchema({
      name: 'Summer',
      slug: 'summer',
      numberOfItems: 25,
    });
    expect(schema.numberOfItems).toBe(25);
  });

  it('should include URL with slug', () => {
    const schema = collectionSchema({
      name: 'Summer',
      slug: 'summer-2024',
    });
    expect(schema.url).toContain('/collections/summer-2024');
  });
});

describe('breadcrumbSchema', () => {
  it('should return valid breadcrumb schema', () => {
    const schema = breadcrumbSchema([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
      { label: 'Test Product' },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items.length).toBe(3);
  });

  it('should set correct positions', () => {
    const schema = breadcrumbSchema([
      { label: 'Home', url: '/' },
      { label: 'Products', url: '/products' },
    ]);
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
  });

  it('should include URL when provided', () => {
    const schema = breadcrumbSchema([
      { label: 'Home', url: '/' },
    ]);
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items[0].item).toContain('/');
  });

  it('should not include URL when absent', () => {
    const schema = breadcrumbSchema([
      { label: 'Current Page' },
    ]);
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items[0].item).toBeUndefined();
  });

  it('should handle empty items', () => {
    const schema = breadcrumbSchema([]);
    const items = schema.itemListElement as Record<string, unknown>[];
    expect(items.length).toBe(0);
  });
});

describe('img', () => {
  it('should return placeholder for null/undefined', () => {
    expect(img(null)).toBe('/placeholder.svg');
    expect(img(undefined)).toBe('/placeholder.svg');
    expect(img('')).toBe('/placeholder.svg');
  });

  it('should return non-Cloudinary URLs as-is', () => {
    const url = 'https://example.com/image.jpg';
    expect(img(url)).toBe(url);
  });

  it('should add transforms to Cloudinary URLs', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/test.jpg';
    const result = img(url);
    expect(result).toContain('f_auto');
    expect(result).toContain('q_auto');
    expect(result).toContain('/image/upload/');
  });

  it('should add width transform', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/test.jpg';
    const result = img(url, { width: 640 });
    expect(result).toContain('w_640');
  });

  it('should add height transform', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/test.jpg';
    const result = img(url, { height: 480 });
    expect(result).toContain('h_480');
  });

  it('should add quality transform', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/test.jpg';
    const result = img(url, { quality: 80 });
    expect(result).toContain('q_80');
  });

  it('should add format transform', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/test.jpg';
    const result = img(url, { format: 'webp' });
    expect(result).toContain('f_webp');
  });
});

describe('imgSet', () => {
  it('should return src only for non-Cloudinary URLs', () => {
    const result = imgSet('https://example.com/image.jpg');
    expect(result).toEqual({ src: 'https://example.com/image.jpg' });
  });

  it('should return placeholder for null/undefined', () => {
    expect(imgSet(null)).toEqual({ src: '/placeholder.svg' });
    expect(imgSet(undefined)).toEqual({ src: '/placeholder.svg' });
  });

  it('should generate srcSet for Cloudinary URLs', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/test.jpg';
    const result = imgSet(url);
    expect('srcSet' in result).toBe(true);
    if ('srcSet' in result) {
      expect(result.srcSet).toContain('320w');
      expect(result.srcSet).toContain('640w');
      expect(result.srcSet).toContain('960w');
      expect(result.srcSet).toContain('1280w');
    }
  });

  it('should use second width as default src', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/test.jpg';
    const result = imgSet(url);
    expect(result.src).toContain('w_640');
  });

  it('should support custom widths', () => {
    const url = 'https://res.cloudinary.com/test/image/upload/test.jpg';
    const result = imgSet(url, [400, 800]);
    if ('srcSet' in result) {
      expect(result.srcSet).toContain('400w');
      expect(result.srcSet).toContain('800w');
      expect(result.srcSet).not.toContain('320w');
    }
  });
});
