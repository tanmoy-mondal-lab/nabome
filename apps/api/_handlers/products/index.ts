/**
 * Product API Handlers
 * Source: REST_API_SPECIFICATION.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Public read endpoints for products, variants, media, and attributes.
 */

import { productListQuerySchema } from '@nabome/validation';

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { productService } from '../../_lib/products/service.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/products — List products with filtering, sorting, and pagination
 */
export async function handleProductsList(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // Validate query parameters
    const validated = productListQuerySchema.parse({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      sort: queryParams.sort || 'createdAt',
      order: queryParams.order || 'desc',
      category: queryParams.category,
      collection: queryParams.collection,
      brand: queryParams.brand,
      gender: queryParams.gender,
      status: queryParams.status,
      minPrice: queryParams.minPrice
        ? parseFloat(queryParams.minPrice)
        : undefined,
      maxPrice: queryParams.maxPrice
        ? parseFloat(queryParams.maxPrice)
        : undefined,
      inStock:
        queryParams.inStock === 'true'
          ? true
          : queryParams.inStock === 'false'
            ? false
            : undefined,
      isFeatured:
        queryParams.isFeatured === 'true'
          ? true
          : queryParams.isFeatured === 'false'
            ? false
            : undefined,
      isNew:
        queryParams.isNew === 'true'
          ? true
          : queryParams.isNew === 'false'
            ? false
            : undefined,
      isTrending:
        queryParams.isTrending === 'true'
          ? true
          : queryParams.isTrending === 'false'
            ? false
            : undefined,
      tags: queryParams.tags ? queryParams.tags.split(',') : undefined,
    });

    const result = await productService.list(validated);

    return okJson(
      {
        products: result.products,
        pagination: result.pagination,
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
 * GET /api/v1/products/{id} — Get a single product by ID
 */
export async function handleProductGet(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;
    if (!id)
      return errorJson(ApiError.validation('Missing id'), context.requestId);

    const product = await productService.getById(id!);

    if (!product) {
      return errorJson(
        ApiError.notFound('Product not found'),
        context.requestId,
      );
    }

    // Only return published products for public access
    if (product.status !== 'published' && product.status !== 'scheduled') {
      return errorJson(
        ApiError.notFound('Product not found'),
        context.requestId,
      );
    }

    return okJson(product, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/products/slug/{slug} — Get a single product by slug
 */
export async function handleProductGetBySlug(
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { slug } = params;
    if (!slug)
      return errorJson(ApiError.validation('Missing slug'), context.requestId);

    const product = await productService.getBySlug(slug!);

    if (!product) {
      return errorJson(
        ApiError.notFound('Product not found'),
        context.requestId,
      );
    }

    // Only return published products for public access
    if (product.status !== 'published' && product.status !== 'scheduled') {
      return errorJson(
        ApiError.notFound('Product not found'),
        context.requestId,
      );
    }

    return okJson(product, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/products/featured — Get featured products
 */
export async function handleProductsFeatured(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 10;

    const products = await productService.getFeatured(limit);

    const response = okJson({ products }, context.requestId);
    // Add caching headers to improve TTFB - cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.headers.set('CDN-Cache-Control', 'public, max-age=300');

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/products/new — Get new arrivals
 */
export async function handleProductsNew(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 10;

    const products = await productService.getNew(limit);

    const response = okJson({ products }, context.requestId);
    // Add caching headers to improve TTFB - cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.headers.set('CDN-Cache-Control', 'public, max-age=300');

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/products/trending — Get trending products
 */
export async function handleProductsTrending(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 10;

    const products = await productService.getTrending(limit);

    const response = okJson({ products }, context.requestId);
    // Add caching headers to improve TTFB - cache for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    response.headers.set('CDN-Cache-Control', 'public, max-age=300');

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// Register routes
register('GET', 'products', handleProductsList);
register('GET', 'products/{id}', handleProductGet);
register('GET', 'products/slug/{slug}', handleProductGetBySlug);
register('GET', 'products/featured', handleProductsFeatured);
register('GET', 'products/new', handleProductsNew);
register('GET', 'products/trending', handleProductsTrending);
