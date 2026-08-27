/**
 * Structured Data Component
 * Source: CATALOG_ARCHITECTURE.md, SEO_ARCHITECTURE.md (binding)
 *
 * Generates JSON-LD structured data for SEO, including Product,
 * Organization, BreadcrumbList, and other schemas.
 */

import type { Product, Category, Collection } from '@nabome/types';

interface StructuredDataProps {
  type: 'product' | 'organization' | 'breadcrumb' | 'collection' | 'category';
  data: Product | Category | Collection | any;
  baseUrl?: string;
}

/**
 * Generate Product structured data
 */
function generateProductStructuredData(product: Product, baseUrl: string) {
  const imageUrl = product.media?.[0]?.url;
  const price =
    typeof product.basePrice === 'string'
      ? parseFloat(product.basePrice)
      : parseFloat(product.basePrice.amount);

  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || '',
    image: imageUrl ? [imageUrl] : [],
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand.name,
        }
      : undefined,
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'INR',
      availability: product.variants?.some(
        (v) => v.availableStock - v.reservedStock > 0,
      )
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/products/${product.slug}`,
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };
}

/**
 * Generate Organization structured data
 */
function generateOrganizationStructuredData(baseUrl: string) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name: 'Nabome',
    url: baseUrl,
    logo: `${baseUrl}/logo.svg`,
    description: 'Nabome Commerce Operating System',
  };
}

/**
 * Generate BreadcrumbList structured data
 */
function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Collection structured data
 */
function generateCollectionStructuredData(
  collection: Collection,
  baseUrl: string,
) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description || '',
    url: `${baseUrl}/collections/${collection.slug}`,
    image: collection.imageUrl ? [collection.imageUrl] : [],
  };
}

/**
 * Generate Category structured data
 */
function generateCategoryStructuredData(category: Category, baseUrl: string) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || '',
    url: `${baseUrl}/categories/${category.slug}`,
    image:
      category.iconUrl || category.banner
        ? [category.iconUrl || category.banner!].filter(Boolean)
        : [],
  };
}

export function StructuredData({
  type,
  data,
  baseUrl = 'https://nabome.com',
}: StructuredDataProps) {
  let structuredData: any;

  switch (type) {
    case 'product':
      structuredData = generateProductStructuredData(data as Product, baseUrl);
      break;
    case 'organization':
      structuredData = generateOrganizationStructuredData(baseUrl);
      break;
    case 'breadcrumb':
      structuredData = generateBreadcrumbStructuredData(data as any);
      break;
    case 'collection':
      structuredData = generateCollectionStructuredData(
        data as Collection,
        baseUrl,
      );
      break;
    case 'category':
      structuredData = generateCategoryStructuredData(
        data as Category,
        baseUrl,
      );
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
