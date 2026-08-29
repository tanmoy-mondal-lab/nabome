/**
 * CMS Product API Handlers
 * Source: CATALOG_ARCHITECTURE.md, CMS_ENGINE_ARCHITECTURE.md (binding)
 *
 * Provides product data endpoints for CMS integration, specifically for
 * homepage and landing page product displays.
 */

import { collectionService } from '../../_lib/collections/service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { productService } from '../../_lib/products/service.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/cms/products/featured — Get featured products for CMS
 * Returns products optimized for homepage display with limited fields
 */
export async function handleCmsFeaturedProducts(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 8;

    const products = await productService.getFeatured(limit);

    // Transform for CMS - return only essential fields
    const cmsProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      imageUrl: product.media?.[0]?.url || null,
      category: {
        id: product.category?.id,
        name: product.category?.name,
        slug: product.category?.slug,
      },
      brand: {
        id: product.brand?.id,
        name: product.brand?.name,
        slug: product.brand?.slug,
      },
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isTrending: product.isTrending,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
    }));

    return okJson({ products: cmsProducts }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/cms/products/new-arrivals — Get new arrivals for CMS
 * Returns newly published products for homepage display
 */
export async function handleCmsNewArrivals(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 8;

    const products = await productService.getNew(limit);

    // Transform for CMS
    const cmsProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      imageUrl: product.media?.[0]?.url || null,
      category: {
        id: product.category?.id,
        name: product.category?.name,
        slug: product.category?.slug,
      },
      brand: {
        id: product.brand?.id,
        name: product.brand?.name,
        slug: product.brand?.slug,
      },
      isNew: product.isNew,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
    }));

    return okJson({ products: cmsProducts }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/cms/products/trending — Get trending products for CMS
 * Returns trending products for homepage display
 */
export async function handleCmsTrendingProducts(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 8;

    const products = await productService.getTrending(limit);

    // Transform for CMS
    const cmsProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      imageUrl: product.media?.[0]?.url || null,
      category: {
        id: product.category?.id,
        name: product.category?.name,
        slug: product.category?.slug,
      },
      brand: {
        id: product.brand?.id,
        name: product.brand?.name,
        slug: product.brand?.slug,
      },
      isTrending: product.isTrending,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      totalSold: product.totalSold,
    }));

    return okJson({ products: cmsProducts }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/cms/products/by-ids — Get products by IDs for CMS
 * Returns specific products by their IDs for CMS blocks
 */
export async function handleCmsProductsByIds(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const ids = url.searchParams.get('ids');

    if (!ids) {
      return errorJson(
        ApiError.validation('Product IDs are required'),
        context.requestId,
      );
    }

    const idArray = ids.split(',').map((id) => id.trim());

    // Fetch products by IDs using the service
    const products = await Promise.all(
      idArray.map((id) => productService.getById(id)),
    );

    // Filter out nulls and transform for CMS
    const cmsProducts = products
      .filter(
        (product: any): product is NonNullable<typeof product> =>
          product !== null,
      )
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        imageUrl: product.media?.[0]?.url || null,
        category: {
          id: product.category?.id,
          name: product.category?.name,
          slug: product.category?.slug,
        },
        brand: {
          id: product.brand?.id,
          name: product.brand?.name,
          slug: product.brand?.slug,
        },
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
      }));

    return okJson({ products: cmsProducts }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/cms/collections/featured — Get featured collections for CMS
 * Returns collections with their products for homepage display
 */
export async function handleCmsFeaturedCollections(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 3;

    const collections = await collectionService.getFeatured(limit);

    // Transform for CMS
    const cmsCollections = collections.map(
      (
        collection: Awaited<
          ReturnType<typeof collectionService.getFeatured>
        >[number],
      ) => ({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        imageUrl: collection.imageUrl,
        type: collection.type,
        products:
          collection.products
            ?.slice(0, 4)
            .map((pc: NonNullable<typeof collection.products>[number]) => ({
              id: pc.product.id,
              name: pc.product.name,
              slug: pc.product.slug,
              basePrice: pc.product.basePrice,
              imageUrl: pc.product.media?.[0]?.url || null,
            })) || [],
      }),
    );

    return okJson({ collections: cmsCollections }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// Register CMS routes
register('GET', 'cms/products/featured', handleCmsFeaturedProducts);
register('GET', 'cms/products/new-arrivals', handleCmsNewArrivals);
register('GET', 'cms/products/trending', handleCmsTrendingProducts);
register('GET', 'cms/products/by-ids', handleCmsProductsByIds);
register('GET', 'cms/collections/featured', handleCmsFeaturedCollections);
