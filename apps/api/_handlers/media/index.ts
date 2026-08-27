/**
 * Media API Handlers
 * Secure media upload and management for products
 * Requires shop owner authentication
 */

import { requireAuth } from '../../_lib/auth/auth-middleware.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { mediaService } from '../../_lib/media/service.ts';
import { getPrisma } from '../../_lib/prisma.ts';
import { checkRateLimit } from '../../_lib/ratelimit.ts';
import { register } from '../register.ts';

/**
 * POST /api/v1/media/upload — Upload media for a product
 * Requires: shop owner authentication, product belongs to shop
 */
export async function handleMediaUpload(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    // Authenticate and get user
    const authContext = await requireAuth(request);

    // Verify user is shop owner
    if (authContext.role !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Only shop owners can upload media'),
        context.requestId,
      );
    }

    // Rate limiting (10 uploads per minute per user)
    const rateLimitResult = await checkRateLimit(
      context.env.KV,
      'authenticated',
      `media:upload:${authContext.userId}`,
    );
    if (!rateLimitResult.allowed) {
      return errorJson(
        ApiError.rateLimited(
          `Rate limit exceeded. Try again in ${rateLimitResult.resetSeconds} seconds.`,
        ),
        context.requestId,
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file');
    const productId = formData.get('productId');
    const variantId = formData.get('variantId');
    const altText = formData.get('altText');
    const sortOrderStr = formData.get('sortOrder');

    // Validate required fields
    if (!file || typeof file === 'string') {
      return errorJson(
        ApiError.validation('File is required'),
        context.requestId,
      );
    }
    if (!productId || typeof productId !== 'string') {
      return errorJson(
        ApiError.validation('Product ID is required'),
        context.requestId,
      );
    }

    const sortOrder = sortOrderStr ? parseInt(sortOrderStr) : undefined;

    // Get user's shop
    const prisma = getPrisma();
    const shop = await prisma.shop.findFirst({
      where: { ownerId: authContext.userId },
      select: { id: true },
    });

    if (!shop) {
      return errorJson(ApiError.forbidden('Shop not found'), context.requestId);
    }

    // Upload media
    const result = await mediaService.uploadProductMedia(
      {
        productId,
        variantId: variantId || undefined,
        file,
        shopId: shop.id,
        altText: altText || undefined,
        sortOrder,
      },
      context.env.MEDIA_BUCKET as any,
    );

    return okJson(result, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.internal('Upload failed'), context.requestId);
  }
}

/**
 * DELETE /api/v1/media/{id} — Delete media
 * Requires: shop owner authentication, media belongs to shop
 */
export async function handleMediaDelete(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    // Authenticate and get user
    const authContext = await requireAuth(request);

    // Verify user is shop owner
    if (authContext.role !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Only shop owners can delete media'),
        context.requestId,
      );
    }

    const { id } = params;

    if (!id) {
      return errorJson(
        ApiError.validation('Media ID is required'),
        context.requestId,
      );
    }

    // Get user's shop
    const prisma = getPrisma();
    const shop = await prisma.shop.findFirst({
      where: { ownerId: authContext.userId },
      select: { id: true },
    });

    if (!shop) {
      return errorJson(ApiError.forbidden('Shop not found'), context.requestId);
    }

    // Delete media
    await mediaService.deleteProductMedia(
      id,
      shop.id,
      context.env.MEDIA_BUCKET as any,
    );

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return errorJson(ApiError.notFound('Media not found'), context.requestId);
    }
    if (error instanceof Error && error.message.includes('forbidden')) {
      return errorJson(ApiError.forbidden(error.message), context.requestId);
    }
    return errorJson(ApiError.internal('Delete failed'), context.requestId);
  }
}

/**
 * PATCH /api/v1/media/{id} — Update media metadata
 * Requires: shop owner authentication, media belongs to shop
 */
export async function handleMediaUpdate(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    // Authenticate and get user
    const authContext = await requireAuth(request);

    // Verify user is shop owner
    if (authContext.role !== 'shop_owner') {
      return errorJson(
        ApiError.forbidden('Only shop owners can update media'),
        context.requestId,
      );
    }

    const { id } = params;

    if (!id) {
      return errorJson(
        ApiError.validation('Media ID is required'),
        context.requestId,
      );
    }

    // Parse request body
    const body = (await request.json()) as {
      altText?: string;
      sortOrder?: number;
    };

    // Get user's shop
    const prisma = getPrisma();
    const shop = await prisma.shop.findFirst({
      where: { ownerId: authContext.userId },
      select: { id: true },
    });

    if (!shop) {
      return errorJson(ApiError.forbidden('Shop not found'), context.requestId);
    }

    // Update media
    const media = await mediaService.updateProductMedia(id!, shop.id, body);

    return okJson(media, context.requestId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return errorJson(ApiError.notFound('Media not found'), context.requestId);
    }
    if (error instanceof Error && error.message.includes('forbidden')) {
      return errorJson(ApiError.forbidden(error.message), context.requestId);
    }
    return errorJson(ApiError.internal('Update failed'), context.requestId);
  }
}

/**
 * GET /api/v1/media/product/{productId} — Get media for a product
 * Public endpoint (no authentication required for read)
 */
export async function handleMediaGetByProduct(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { productId } = params;

    if (!productId) {
      return errorJson(
        ApiError.validation('Product ID is required'),
        context.requestId,
      );
    }

    const media = await mediaService.getProductMedia(productId);

    return okJson({ media }, context.requestId);
  } catch (error) {
    return errorJson(
      ApiError.internal('Failed to fetch media'),
      context.requestId,
    );
  }
}

// Register routes
register('POST', 'media/upload', handleMediaUpload);
register('DELETE', 'media/{id}', handleMediaDelete);
register('PATCH', 'media/{id}', handleMediaUpdate);
register('GET', 'media/product/{productId}', handleMediaGetByProduct);
