/**
 * Search Index Preparation Utilities
 * Source: CATALOG_ARCHITECTURE.md, SEARCH_ENGINE_ARCHITECTURE.md (binding)
 *
 * Provides utilities for preparing product, category, and collection data
 * for search indexing. Transforms database entities into search-ready documents.
 */

import type { Product, Category, Collection, Brand } from '@nabome/types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SearchDocument {
  id: string;
  type: 'product' | 'category' | 'collection' | 'brand';
  title: string;
  description: string;
  slug: string;
  url: string;
  imageUrl?: string;
  category?: string;
  brand?: string;
  tags?: string[];
  price?: number;
  comparePrice?: number;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  gender?: 'men' | 'women' | 'unisex';
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ── Product Index Preparation ─────────────────────────────────────────────────

/**
 * Transform a Product entity into a search document
 */
export function prepareProductForSearch(
  product: Product,
  baseUrl: string = 'https://nabome.com',
): SearchDocument {
  const price =
    typeof product.basePrice === 'string'
      ? parseFloat(product.basePrice)
      : parseFloat(product.basePrice.amount);
  const comparePrice = product.compareAtPrice
    ? typeof product.compareAtPrice === 'string'
      ? parseFloat(product.compareAtPrice)
      : parseFloat(product.compareAtPrice.amount)
    : undefined;

  const hasStock = product.variants?.some(
    (v) => v.availableStock - v.reservedStock > 0,
  );

  return {
    id: product.id,
    type: 'product',
    title: product.name,
    description: product.shortDescription || product.description || '',
    slug: product.slug,
    url: `${baseUrl}/products/${product.slug}`,
    imageUrl: product.media?.[0]?.url,
    category: product.category?.name,
    brand: product.brand?.name,
    tags: product.tags,
    price,
    comparePrice,
    rating: product.averageRating,
    reviewCount: product.reviewCount,
    inStock: hasStock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    isTrending: product.isTrending,
    gender: product.gender,
    attributes: product.meta || undefined,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Transform multiple Product entities into search documents
 */
export function prepareProductsForSearch(
  products: Product[],
  baseUrl: string = 'https://nabome.com',
): SearchDocument[] {
  return products.map((product) => prepareProductForSearch(product, baseUrl));
}

// ── Category Index Preparation ───────────────────────────────────────────────

/**
 * Transform a Category entity into a search document
 */
export function prepareCategoryForSearch(
  category: Category,
  baseUrl: string = 'https://nabome.com',
): SearchDocument {
  return {
    id: category.id,
    type: 'category',
    title: category.name,
    description: category.description || '',
    slug: category.slug,
    url: `${baseUrl}/categories/${category.slug}`,
    imageUrl: category.iconUrl || category.banner || undefined,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

/**
 * Transform multiple Category entities into search documents
 */
export function prepareCategoriesForSearch(
  categories: Category[],
  baseUrl: string = 'https://nabome.com',
): SearchDocument[] {
  return categories.map((category) =>
    prepareCategoryForSearch(category, baseUrl),
  );
}

// ── Collection Index Preparation ─────────────────────────────────────────────

/**
 * Transform a Collection entity into a search document
 */
export function prepareCollectionForSearch(
  collection: Collection,
  baseUrl: string = 'https://nabome.com',
): SearchDocument {
  return {
    id: collection.id,
    type: 'collection',
    title: collection.name,
    description: collection.description || '',
    slug: collection.slug,
    url: `${baseUrl}/collections/${collection.slug}`,
    imageUrl: collection.imageUrl || undefined,
    attributes: {
      type: collection.type,
      isFeatured: collection.isFeatured,
      startsAt: collection.startsAt,
      endsAt: collection.endsAt,
    },
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
  };
}

/**
 * Transform multiple Collection entities into search documents
 */
export function prepareCollectionsForSearch(
  collections: Collection[],
  baseUrl: string = 'https://nabome.com',
): SearchDocument[] {
  return collections.map((collection) =>
    prepareCollectionForSearch(collection, baseUrl),
  );
}

// ── Brand Index Preparation ─────────────────────────────────────────────────

/**
 * Transform a Brand entity into a search document
 */
export function prepareBrandForSearch(
  brand: Brand,
  baseUrl: string = 'https://nabome.com',
): SearchDocument {
  return {
    id: brand.id,
    type: 'brand',
    title: brand.name,
    description: '',
    slug: brand.slug,
    url: `${baseUrl}/brands/${brand.slug}`,
    imageUrl: brand.logoUrl || undefined,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}

/**
 * Transform multiple Brand entities into search documents
 */
export function prepareBrandsForSearch(
  brands: Brand[],
  baseUrl: string = 'https://nabome.com',
): SearchDocument[] {
  return brands.map((brand) => prepareBrandForSearch(brand, baseUrl));
}

// ── Batch Index Preparation ───────────────────────────────────────────────────

/**
 * Prepare all catalog entities for search indexing
 */
export async function prepareCatalogForSearch(params: {
  products?: Product[];
  categories?: Category[];
  collections?: Collection[];
  brands?: Brand[];
  baseUrl?: string;
}): Promise<SearchDocument[]> {
  const {
    products = [],
    categories = [],
    collections = [],
    brands = [],
    baseUrl = 'https://nabome.com',
  } = params;

  const documents: SearchDocument[] = [
    ...prepareProductsForSearch(products, baseUrl),
    ...prepareCategoriesForSearch(categories, baseUrl),
    ...prepareCollectionsForSearch(collections, baseUrl),
    ...prepareBrandsForSearch(brands, baseUrl),
  ];

  return documents;
}

// ── Search Index Export ───────────────────────────────────────────────────────

/**
 * Export search documents as JSON for search engine indexing
 */
export function exportSearchDocuments(documents: SearchDocument[]): string {
  return JSON.stringify(documents, null, 2);
}

/**
 * Export search documents as NDJSON (Newline Delimited JSON) for bulk indexing
 */
export function exportSearchDocumentsNDJSON(
  documents: SearchDocument[],
): string {
  return documents.map((doc) => JSON.stringify(doc)).join('\n');
}

// ── Search Index Validation ───────────────────────────────────────────────────

/**
 * Validate a search document has required fields
 */
export function validateSearchDocument(document: SearchDocument): boolean {
  const requiredFields = [
    'id',
    'type',
    'title',
    'slug',
    'url',
    'createdAt',
    'updatedAt',
  ];
  return requiredFields.every(
    (field) => document[field as keyof SearchDocument] !== undefined,
  );
}

/**
 * Filter out invalid search documents
 */
export function filterValidDocuments(
  documents: SearchDocument[],
): SearchDocument[] {
  return documents.filter(validateSearchDocument);
}
