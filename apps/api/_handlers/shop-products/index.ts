/**
 * Shop Product Management API Handlers
 * Source: SHOP_OWNER_DASHBOARD_ARCHITECTURE.md, REST_API_SPECIFICATION.md
 *
 * Shop owner endpoints for product management (CRUD operations)
 * Extends the public product API with shop-specific write operations
 */

import { z } from 'zod';

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import { productService } from '../../_lib/products/service.ts';
import { hasShopAccess } from '../../_lib/shop/staff-service.ts';
import { register } from '../register.ts';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for product creation
 */
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  basePrice: z.string().min(0, 'Price must be non-negative'),
  compareAtPrice: z.string().optional(),
  costPrice: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  trackInventory: z.boolean().default(true),
  requiresShipping: z.boolean().default(true),
  publishedAt: z.string().optional(),
});

/**
 * Schema for product update
 */
const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).optional(),
  basePrice: z.string().min(0).optional(),
  compareAtPrice: z.string().optional(),
  costPrice: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  trackInventory: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

/**
 * Schema for product query options
 */
const productQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z
    .enum(['createdAt', 'price', 'rating', 'popularity', 'name', 'sortOrder'])
    .default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// SHOP OWNER PRODUCT ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/shop/products — Get shop owner's products
 */
export async function handleGetShopProducts(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId!;
    const userRole = context.userRole;

    if (!userId)
      return errorJson(
        ApiError.unauthorized('Auth required'),
        context.requestId,
      );
    const url = new URL(_request.url);
    const queryOptions = productQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );
    const requestedShopId = url.searchParams.get('shopId') || undefined;
    let shop: any = null;
    if (requestedShopId) {
      if (!(await hasShopAccess(userId, requestedShopId)))
        return errorJson(
          ApiError.forbidden('Shop access denied'),
          context.requestId,
        );
      shop = await getPrisma().shop.findUnique({
        where: { id: requestedShopId },
      });
    } else {
      shop = await getPrisma().shop.findFirst({ where: { ownerId: userId } });
      if (!shop) {
        const m = await getPrisma().shopMember.findFirst({
          where: { userId, status: 'active' },
          include: { shop: true },
        });
        shop = m?.shop ?? null;
      }
    }
    if (!shop)
      return errorJson(
        ApiError.forbidden('Shop not found for this user'),
        context.requestId,
      );

    // Get products for this shop
    const result = await productService.list({
      ...queryOptions,
      shopId: shop.id,
      status: queryOptions.status as any,
      categoryId: queryOptions.category,
      brandId: queryOptions.brand,
    });

    return okJson(
      {
        products: result.products,
        total: result.pagination.total,
      },
      context.requestId,
    );
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * POST /api/v1/shop/products — Create a new product
 */
export async function handleCreateShopProduct(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId!;
    const userRole = context.userRole;

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = createProductSchema.parse(body);

    // Get shop ID for this user
    const shop = await getPrisma().shop.findFirst({
      where: { ownerId: userId },
    });

    if (!shop) {
      return errorJson(
        ApiError.forbidden('Shop not found for this user'),
        context.requestId,
      );
    }

    // Create product via service with shop ID
    const product = await productService.create({
      ...validated,
      shopId: shop.id,
    } as any);

    return okJson({ product }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/shop/products/{id} — Get product details
 */
export async function handleGetShopProduct(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId!;
    const userRole = context.userRole;
    const { id } = params;
    if (!id)
      return errorJson(ApiError.validation('Missing id'), context.requestId);

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    // Get shop ID for this user
    const shop = await getPrisma().shop.findFirst({
      where: { ownerId: userId },
    });

    if (!shop) {
      return errorJson(
        ApiError.forbidden('Shop not found for this user'),
        context.requestId,
      );
    }

    // Get product and verify ownership
    const product = await productService.getById(id!);

    if (!product) {
      return errorJson(
        ApiError.notFound('Product not found'),
        context.requestId,
      );
    }

    if (product.shopId !== shop.id) {
      return errorJson(
        ApiError.forbidden('You do not own this product'),
        context.requestId,
      );
    }

    return okJson({ product }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to retrieve product'),
      context.requestId,
    );
  }
}

/**
 * PATCH /api/v1/shop/products/{id} — Update product
 */
export async function handleUpdateShopProduct(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId!;
    const userRole = context.userRole;
    const { id } = params;
    if (!id)
      return errorJson(ApiError.validation('Missing id'), context.requestId);

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const validated = updateProductSchema.parse(body);

    // Get shop ID for this user
    const shop = await getPrisma().shop.findFirst({
      where: { ownerId: userId },
    });

    if (!shop) {
      return errorJson(
        ApiError.forbidden('Shop not found for this user'),
        context.requestId,
      );
    }

    // Verify ownership
    const existing = await productService.getById(id!);
    if (!existing) {
      return errorJson(
        ApiError.notFound('Product not found'),
        context.requestId,
      );
    }

    if (existing.shopId !== shop.id) {
      return errorJson(
        ApiError.forbidden('You do not own this product'),
        context.requestId,
      );
    }

    // Update product - convert string prices to numbers for service
    const product = await productService.update(id!, {
      ...validated,
      basePrice: validated.basePrice
        ? parseFloat(validated.basePrice)
        : undefined,
      compareAtPrice: validated.compareAtPrice
        ? parseFloat(validated.compareAtPrice)
        : undefined,
      costPrice: validated.costPrice
        ? parseFloat(validated.costPrice)
        : undefined,
    } as any);

    return okJson({ product }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * DELETE /api/v1/shop/products/{id} — Delete product
 */
export async function handleDeleteShopProduct(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId!;
    const userRole = context.userRole;
    const { id } = params;
    if (!id)
      return errorJson(ApiError.validation('Missing id'), context.requestId);

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    // Get shop ID for this user
    const shop = await getPrisma().shop.findFirst({
      where: { ownerId: userId },
    });

    if (!shop) {
      return errorJson(
        ApiError.forbidden('Shop not found for this user'),
        context.requestId,
      );
    }

    // Verify ownership
    const existing = await productService.getById(id!);
    if (!existing) {
      return errorJson(
        ApiError.notFound('Product not found'),
        context.requestId,
      );
    }

    if (existing.shopId !== shop.id) {
      return errorJson(
        ApiError.forbidden('You do not own this product'),
        context.requestId,
      );
    }

    // Soft-delete product (archive)
    await productService.delete(id!);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to delete product'),
      context.requestId,
    );
  }
}

/**
 * POST /api/v1/shop/products/{id}/publish — Publish product
 */
export async function handlePublishShopProduct(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId!;
    const userRole = context.userRole;
    const { id } = params;
    if (!id)
      return errorJson(ApiError.validation('Missing id'), context.requestId);

    if (!userId || userRole !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Shop owner access required'),
        context.requestId,
      );
    }

    // Get shop ID for this user
    const shop = await getPrisma().shop.findFirst({
      where: { ownerId: userId },
    });

    if (!shop) {
      return errorJson(
        ApiError.forbidden('Shop not found for this user'),
        context.requestId,
      );
    }

    // Verify ownership
    const existing = await productService.getById(id!);
    if (!existing) {
      return errorJson(
        ApiError.notFound('Product not found'),
        context.requestId,
      );
    }

    if (existing.shopId !== shop.id) {
      return errorJson(
        ApiError.forbidden('You do not own this product'),
        context.requestId,
      );
    }

    // Publish product
    const product = await productService.update(id!, {
      status: 'published',
    } as any);

    return okJson({ success: true, product }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.internal(error.message), context.requestId);
    }
    return errorJson(
      ApiError.internal('Failed to publish product'),
      context.requestId,
    );
  }
}

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

// Shop owner product routes
register('GET', 'shop/products', handleGetShopProducts);
register('POST', 'shop/products', handleCreateShopProduct);
register('GET', 'shop/products/{id}', handleGetShopProduct);
register('PATCH', 'shop/products/{id}', handleUpdateShopProduct);
register('DELETE', 'shop/products/{id}', handleDeleteShopProduct);
register('POST', 'shop/products/{id}/publish', handlePublishShopProduct);
