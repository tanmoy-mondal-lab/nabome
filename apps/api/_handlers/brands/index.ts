/**
 * Brand API Handlers
 * Source: REST_API_SPECIFICATION.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Public read endpoints for brands.
 */

import { brandService } from '../../_lib/brands/service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/brands — List brands with filtering and pagination
 */
export async function handleBrandsList(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const result = await brandService.list({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      isActive:
        queryParams.isActive === 'true'
          ? true
          : queryParams.isActive === 'false'
            ? false
            : undefined,
    });

    return okJson(
      {
        brands: result.brands,
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
 * GET /api/v1/brands/{id} — Get a single brand by ID
 */
export async function handleBrandGet(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;

    if (!id) {
      return errorJson(
        ApiError.validation('Brand ID is required'),
        context.requestId,
      );
    }

    const brand = await brandService.getById(id);

    if (!brand) {
      return errorJson(ApiError.notFound('Brand not found'), context.requestId);
    }

    // Only return active brands for public access
    if (!brand.isActive) {
      return errorJson(ApiError.notFound('Brand not found'), context.requestId);
    }

    return okJson(brand, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/brands/slug/{slug} — Get a single brand by slug
 */
export async function handleBrandGetBySlug(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { slug } = params;

    if (!slug) {
      return errorJson(
        ApiError.validation('Brand slug is required'),
        context.requestId,
      );
    }

    const brand = await brandService.getBySlug(slug);

    if (!brand) {
      return errorJson(ApiError.notFound('Brand not found'), context.requestId);
    }

    // Only return active brands for public access
    if (!brand.isActive) {
      return errorJson(ApiError.notFound('Brand not found'), context.requestId);
    }

    return okJson(brand, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/brands/active — Get active brands (for public display)
 */
export async function handleBrandsActive(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 20;

    const brands = await brandService.getActive(limit);

    return okJson({ brands }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// Register routes
register('GET', 'brands', handleBrandsList);
register('GET', 'brands/{id}', handleBrandGet);
register('GET', 'brands/slug/{slug}', handleBrandGetBySlug);
register('GET', 'brands/active', handleBrandsActive);
