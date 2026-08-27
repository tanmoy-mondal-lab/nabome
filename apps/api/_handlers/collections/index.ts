/**
 * Collection API Handlers
 * Source: REST_API_SPECIFICATION.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Public read endpoints for collections.
 */

import { collectionService } from '../../_lib/collections/service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/collections — List collections with filtering and pagination
 */
export async function handleCollectionsList(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const result = await collectionService.list({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      type: queryParams.type as any,
      isActive:
        queryParams.isActive === 'true'
          ? true
          : queryParams.isActive === 'false'
            ? false
            : undefined,
      isFeatured:
        queryParams.isFeatured === 'true'
          ? true
          : queryParams.isFeatured === 'false'
            ? false
            : undefined,
    });

    return okJson(
      {
        collections: result.collections,
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
 * GET /api/v1/collections/{id} — Get a single collection by ID
 */
export async function handleCollectionGet(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;

    if (!id) {
      return errorJson(
        ApiError.validation('Collection ID is required'),
        context.requestId,
      );
    }

    const collection = await collectionService.getById(id);

    if (!collection) {
      return errorJson(
        ApiError.notFound('Collection not found'),
        context.requestId,
      );
    }

    // Only return active collections for public access
    if (!collection.isActive) {
      return errorJson(
        ApiError.notFound('Collection not found'),
        context.requestId,
      );
    }

    return okJson(collection, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/collections/slug/{slug} — Get a single collection by slug
 */
export async function handleCollectionGetBySlug(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { slug } = params;

    if (!slug) {
      return errorJson(
        ApiError.validation('Collection slug is required'),
        context.requestId,
      );
    }

    const collection = await collectionService.getBySlug(slug);

    if (!collection) {
      return errorJson(
        ApiError.notFound('Collection not found'),
        context.requestId,
      );
    }

    // Only return active collections for public access
    if (!collection.isActive) {
      return errorJson(
        ApiError.notFound('Collection not found'),
        context.requestId,
      );
    }

    return okJson(collection, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/collections/featured — Get featured collections
 */
export async function handleCollectionsFeatured(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 10;

    const collections = await collectionService.getFeatured(limit);

    return okJson({ collections }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/collections/active — Get active collections (for public display)
 */
export async function handleCollectionsActive(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 20;

    const collections = await collectionService.getActive(limit);

    return okJson({ collections }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// Register routes
register('GET', 'collections', handleCollectionsList);
register('GET', 'collections/{id}', handleCollectionGet);
register('GET', 'collections/slug/{slug}', handleCollectionGetBySlug);
register('GET', 'collections/featured', handleCollectionsFeatured);
register('GET', 'collections/active', handleCollectionsActive);
