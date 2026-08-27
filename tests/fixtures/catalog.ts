/**
 * Catalog fixtures — categories, brands, collections, products (with
 * variants/media), aligned to the canonical data model (@nabome/types).
 * Deterministic UUID ids (see IDS map).
 */
import type {
  Brand,
  Category,
  Collection,
  Product,
  ProductVariant,
} from '@nabome/types';

export const CATEGORY_IDS = {
  jewelry: '00000000-0000-4000-8000-000000000010',
  decor: '00000000-0000-4000-8000-000000000011',
  craft: '00000000-0000-4000-8000-000000000012',
} as const;

export const PRODUCT_IDS = {
  necklace: '00000000-0000-4000-8000-000000000020',
  vase: '00000000-0000-4000-8000-000000000021',
  scarf: '00000000-0000-4000-8000-000000000022',
} as const;

const TS = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const BRAND_ID = '00000000-0000-4000-8000-000000000030';
const COLLECTION_ID = '00000000-0000-4000-8000-000000000040';

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: CATEGORY_IDS.jewelry,
    parentId: null,
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Handcrafted jewelry',
    imageUrl: null,
    sortOrder: 1,
    isActive: true,
    ...TS,
    ...overrides,
  };
}

export function makeBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: BRAND_ID,
    name: 'Nabome House',
    slug: 'nabome-house',
    logoUrl: null,
    isActive: true,
    ...TS,
    ...overrides,
  };
}

export function makeCollection(
  overrides: Partial<Collection> = {},
): Collection {
  return {
    id: COLLECTION_ID,
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: null,
    imageUrl: null,
    isActive: true,
    ...TS,
    ...overrides,
  };
}

export function makeVariant(
  productId: string,
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id: `00000000-0000-4000-8000-0000000000${productId.slice(-2)}`,
    productId,
    sku: 'NBN-LNK-BRZ-001',
    barcode: null,
    price: { amount: '2499.00', currency: 'INR' },
    compareAtPrice: { amount: '2999.00', currency: 'INR' },
    stock: 25,
    reservedStock: 0,
    attributes: [{ attribute: 'color', value: 'bronze' }],
    isActive: true,
    ...TS,
    ...overrides,
  };
}

export function makeProduct(overrides: Partial<Product> = {}): Product {
  const productId = PRODUCT_IDS.necklace;
  return {
    id: productId,
    categoryId: CATEGORY_IDS.jewelry,
    collectionIds: [COLLECTION_ID],
    brandId: BRAND_ID,
    name: 'Signature Bronze Necklace',
    slug: 'signature-bronze-necklace',
    description: 'Hand-finished bronze pendant necklace.',
    status: 'published',
    price: { amount: '2499.00', currency: 'INR' },
    compareAtPrice: { amount: '2999.00', currency: 'INR' },
    attributes: [
      { attribute: 'material', value: 'bronze' },
      { attribute: 'craft', value: 'hand-finished' },
    ],
    media: [
      {
        id: '00000000-0000-4000-8000-000000000050',
        productId,
        url: 'https://media.nabome.online/necklace-1.webp',
        altText: 'Signature Bronze Necklace',
        sortOrder: 1,
      },
    ],
    variants: [makeVariant(productId)],
    availableStock: 25,
    inventoryStatus: 'in_stock',
    rating: 4.8,
    reviewCount: 12,
    tags: ['jewelry', 'bronze', 'new'],
    publishedAt: TS.createdAt,
    isActive: true,
    ...TS,
    ...overrides,
  };
}

export const CATEGORY_FIXTURES = [
  makeCategory(),
  makeCategory({
    id: CATEGORY_IDS.decor,
    name: 'Décor',
    slug: 'decor',
    description: 'Home décor pieces',
    sortOrder: 2,
  }),
  makeCategory({
    id: CATEGORY_IDS.craft,
    name: 'Craft & Art',
    slug: 'craft-and-art',
    description: 'Contemporary craft and art',
    sortOrder: 3,
  }),
];

export const PRODUCT_FIXTURES = [
  makeProduct(),
  makeProduct({
    id: PRODUCT_IDS.vase,
    name: 'Terracotta Vase',
    slug: 'terracotta-vase',
    description: 'Hand-thrown terracotta vase.',
    price: { amount: '1299.00', currency: 'INR' },
    compareAtPrice: null,
    attributes: [{ attribute: 'material', value: 'terracotta' }],
    categoryId: CATEGORY_IDS.decor,
    availableStock: 40,
    inventoryStatus: 'in_stock',
    variants: [
      makeVariant(PRODUCT_IDS.vase, {
        id: '00000000-0000-4000-8000-000000000061',
        sku: 'NBN-VAS-TER-001',
        price: { amount: '1299.00', currency: 'INR' },
        compareAtPrice: null,
      }),
    ],
  }),
  makeProduct({
    id: PRODUCT_IDS.scarf,
    name: 'Block Print Scarf',
    slug: 'block-print-scarf',
    description: 'Hand-block-printed silk scarf.',
    price: { amount: '1899.00', currency: 'INR' },
    compareAtPrice: { amount: '2199.00', currency: 'INR' },
    categoryId: CATEGORY_IDS.craft,
    availableStock: 0,
    inventoryStatus: 'out_of_stock',
    variants: [
      makeVariant(PRODUCT_IDS.scarf, {
        id: '00000000-0000-4000-8000-000000000062',
        sku: 'NBN-SCR-SIL-001',
        price: { amount: '1899.00', currency: 'INR' },
        stock: 0,
      }),
    ],
  }),
];
