import { z } from 'zod';

import { MAX_ADDRESS_LABEL_LENGTH, MAX_REVIEW_LENGTH } from '@nabome/constants';

// Export zod for use in other packages
export { z };

/**
 * Common schemas shared across domains. Error messages are English for now;
 * localized (bn-IN) messages ship with the i18n implementation.
 * Rules: never `z.any()` for user-facing data; use z.discriminatedUnion for
 * polymorphic payloads; return field-level details on failure.
 */

// ── Common ───────────────────────────────────────────────────────────────────

export const idSchema = z.string().uuid().max(64);

export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .max(254);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

export const pageSchema = z.coerce.number().int().min(1).default(1);
export const limitSchema = (max: number) =>
  z.coerce.number().int().min(1).max(max);

export const offsetPaginationQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema(100),
});

export const cursorPaginationQuerySchema = z.object({
  cursor: z.string().max(256).optional(),
  limit: limitSchema(50),
});

export const sortQuerySchema = z.object({
  sort: z.string().min(1).max(64).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    phone: phoneSchema.optional(),
    turnstileToken: z.string().min(1, 'Bot check required'),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required').max(128),
    turnstileToken: z.string().min(1, 'Bot check required'),
  })
  .strict();

export const logoutSchema = z.object({}).strict();

export const refreshTokenSchema = z.object({}).strict();

export const passwordResetRequestSchema = z
  .object({
    email: emailSchema,
    turnstileToken: z.string().min(1, 'Bot check required'),
  })
  .strict();

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1).max(512),
    password: passwordSchema,
  })
  .strict();

export const emailVerificationSchema = z
  .object({
    token: z.string().min(1).max(512),
  })
  .strict();

export const emailChangeSchema = z
  .object({
    newEmail: emailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    phone: phoneSchema.optional(),
    avatarUrl: z.string().url().max(500).optional(),
    locale: z.enum(['en-IN', 'bn-IN', 'hi-IN']).optional(),
  })
  .strict();

// ── Addresses ────────────────────────────────────────────────────────────────

const addressBaseSchema = {
  label: z.string().trim().min(1).max(MAX_ADDRESS_LABEL_LENGTH),
  recipientName: z.string().trim().min(1).max(120),
  phone: phoneSchema,
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Invalid Indian postal code'),
  country: z.string().trim().min(2).max(2).default('IN'),
  isDefault: z.boolean().default(false),
};

export const createAddressSchema = z.object(addressBaseSchema).strict();

export const updateAddressSchema = createAddressSchema.partial();

// ── Cart ─────────────────────────────────────────────────────────────────────

export const addToCartSchema = z
  .object({
    variantId: idSchema,
    quantity: z.coerce.number().int().min(1).max(99),
  })
  .strict();

export const updateCartItemSchema = z
  .object({
    quantity: z.coerce.number().int().min(0).max(99),
  })
  .strict();

export const cartSyncSchema = z.object({
  items: z
    .array(
      z
        .object({
          variantId: idSchema,
          quantity: z.coerce.number().int().min(1).max(99),
        })
        .strict(),
    )
    .max(100),
});

// ── Checkout ─────────────────────────────────────────────────────────────────

export const createOrderSchema = z
  .object({
    shippingAddressId: idSchema.optional(),
    shippingAddress: createAddressSchema.optional(),
    billingAddressId: idSchema.optional(),
    billingSameAsShipping: z.boolean().default(true),
    couponCode: z.string().trim().min(3).max(32).optional(),
    paymentMethod: z.enum(['razorpay']).default('razorpay'),
  })
  .strict()
  .refine((value) => value.shippingAddressId || value.shippingAddress, {
    message: 'Shipping address is required',
  });

export const verifyPaymentSchema = z
  .object({
    orderId: idSchema,
    razorpayPaymentId: z.string().min(1).max(128),
    razorpayOrderId: z.string().min(1).max(128),
    razorpaySignature: z.string().min(1).max(512),
  })
  .strict();

// ── Orders ───────────────────────────────────────────────────────────────────

export const cancelOrderSchema = z
  .object({
    reason: z.string().trim().min(3).max(500).optional(),
  })
  .strict();

export const returnRequestSchema = z
  .object({
    itemIds: z.array(idSchema).min(1).max(50),
    reason: z.string().trim().min(3).max(1000),
  })
  .strict();

// ── Catalog ──────────────────────────────────────────────────────────────────

export const productStatusSchema = z.enum([
  'draft',
  'scheduled',
  'published',
  'archived',
]);

export const genderSchema = z.enum(['men', 'women', 'unisex']);

export const collectionTypeSchema = z.enum(['manual', 'dynamic', 'smart']);

export const inventoryStatusSchema = z.enum([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'backorder',
]);

export const createProductSchema = z
  .object({
    categoryId: idSchema,
    brandId: idSchema.optional(),
    name: z.string().trim().min(1).max(255),
    slug: slugSchema,
    shortDescription: z.string().trim().max(500).optional(),
    description: z.string().trim().max(10000).optional(),
    status: productStatusSchema.default('draft'),
    isFeatured: z.boolean().default(false),
    isNew: z.boolean().default(false),
    isTrending: z.boolean().default(false),
    gender: genderSchema.default('unisex'),
    sortOrder: z.coerce.number().int().min(0).default(0),
    basePrice: z.coerce.number().min(0).max(99999999.99),
    compareAtPrice: z.coerce.number().min(0).max(99999999.99).optional(),
    costPrice: z.coerce.number().min(0).max(99999999.99).optional(),
    weightGrams: z.coerce.number().int().min(0).max(100000).optional(),
    isActive: z.boolean().default(true),
    metaTitle: z.string().trim().max(300).optional(),
    metaDescription: z.string().trim().max(500).optional(),
    ogImage: z.string().url().max(500).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
    meta: z.record(z.unknown()).optional(),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial();

export const createProductVariantSchema = z
  .object({
    sku: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(255),
    attributes: z.record(z.unknown()).optional(),
    price: z.coerce.number().min(0).max(99999999.99),
    compareAtPrice: z.coerce.number().min(0).max(99999999.99).optional(),
    availableStock: z.coerce.number().int().min(0).max(999999).default(0),
    lowStockThreshold: z.coerce.number().int().min(0).max(9999).default(10),
    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const updateProductVariantSchema = createProductVariantSchema.partial();

export const createCategorySchema = z
  .object({
    parentId: idSchema.optional(),
    name: z.string().trim().min(1).max(120),
    slug: slugSchema,
    description: z.string().trim().max(2000).optional(),
    iconUrl: z.string().url().max(500).optional(),
    banner: z.string().url().max(500).optional(),
    sortOrder: z.coerce.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    isHidden: z.boolean().default(false),
    metaTitle: z.string().trim().max(300).optional(),
    metaDescription: z.string().trim().max(500).optional(),
  })
  .strict();

export const updateCategorySchema = createCategorySchema.partial();

export const createCollectionSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    slug: slugSchema,
    description: z.string().trim().max(2000).optional(),
    imageUrl: z.string().url().max(500).optional(),
    sortOrder: z.coerce.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    type: collectionTypeSchema.default('manual'),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    metaTitle: z.string().trim().max(300).optional(),
    metaDescription: z.string().trim().max(500).optional(),
    rules: z.record(z.unknown()).optional(),
  })
  .strict();

export const updateCollectionSchema = createCollectionSchema.partial();

export const createBrandSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    slug: slugSchema,
    logoUrl: z.string().url().max(500).optional(),
    isActive: z.boolean().default(true),
  })
  .strict();

export const updateBrandSchema = createBrandSchema.partial();

export const productListQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema(100),
  sort: z
    .enum(['createdAt', 'price', 'rating', 'popularity', 'name', 'sortOrder'])
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  category: slugSchema.optional(),
  collection: slugSchema.optional(),
  brand: slugSchema.optional(),
  gender: genderSchema.optional(),
  status: productStatusSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  isTrending: z.coerce.boolean().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
});

export const categoryListQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema(100),
  parentId: idSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  isHidden: z.coerce.boolean().optional(),
});

export const collectionListQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema(100),
  type: collectionTypeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
  cursor: z.string().max(256).optional(),
  limit: limitSchema(50),
  category: slugSchema.optional(),
});

// ── Reviews ──────────────────────────────────────────────────────────────────

export const createReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5),
    title: z.string().trim().min(1).max(120).optional(),
    body: z.string().trim().min(1).max(MAX_REVIEW_LENGTH).optional(),
  })
  .strict()
  .refine((value) => value.title || value.body, {
    message: 'Review text is required',
  });

// ── Notifications ────────────────────────────────────────────────────────────

export const markNotificationsReadSchema = z
  .object({
    ids: z.array(idSchema).max(100).optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>;
export type UpdateProductVariantInput = z.infer<
  typeof updateProductVariantSchema
>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
