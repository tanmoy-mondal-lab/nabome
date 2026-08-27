/**
 * Search API Handlers
 * Source: REST_API_SPECIFICATION.md, SEARCH_ENGINE_ARCHITECTURE.md (binding)
 *
 * Public read endpoints for search, autocomplete, trending, and search history.
 */

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import type {
  SearchFilters,
  SearchSort,
} from '../../_lib/search/repository.ts';
import { searchService } from '../../_lib/search/service.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/search — Full-text search with filters and sorting
 */
export async function handleSearch(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // Parse query parameters
    const query = queryParams.q || undefined;
    const limit = queryParams.limit ? parseInt(queryParams.limit) : 24;
    const cursor = queryParams.cursor || undefined;

    // Parse filters
    const filters: SearchFilters = {};
    if (queryParams.category) {
      filters.category = queryParams.category.split(',');
    }
    if (queryParams.brand) {
      filters.brand = queryParams.brand.split(',');
    }
    if (queryParams.minPrice) {
      filters.minPrice = parseFloat(queryParams.minPrice);
    }
    if (queryParams.maxPrice) {
      filters.maxPrice = parseFloat(queryParams.maxPrice);
    }
    if (queryParams.minRating) {
      filters.minRating = parseFloat(queryParams.minRating);
    }
    if (queryParams.inStock !== undefined) {
      filters.inStock = queryParams.inStock === 'true';
    }
    if (queryParams.tags) {
      filters.tags = queryParams.tags.split(',');
    }
    if (queryParams.gender) {
      filters.gender = queryParams.gender.split(',') as (
        'men' | 'women' | 'unisex'
      )[];
    }
    if (queryParams.isNew !== undefined) {
      filters.isNew = queryParams.isNew === 'true';
    }
    if (queryParams.isFeatured !== undefined) {
      filters.isFeatured = queryParams.isFeatured === 'true';
    }
    if (queryParams.isTrending !== undefined) {
      filters.isTrending = queryParams.isTrending === 'true';
    }

    // Parse sort
    const sortField = queryParams.sort || 'relevance';
    const sortOrder = queryParams.order || 'desc';
    const sort: SearchSort = {
      field: sortField as SearchSort['field'],
      order: sortOrder as SearchSort['order'],
    };

    // Get user ID from context (if authenticated)
    const userId = context.userId;
    const guestId = context.guestId;

    const result = await searchService.search({
      query,
      filters,
      sort,
      limit,
      cursor,
      userId,
      guestId,
    });

    return okJson(
      {
        results: result.results,
        total: result.total,
        nextCursor: result.nextCursor,
        facets: result.facets,
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
 * GET /api/v1/search/autocomplete — Get autocomplete suggestions
 */
export async function handleSearchAutocomplete(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 8;

    if (query.length < 2) {
      return okJson({ suggestions: [] }, context.requestId);
    }

    const suggestions = await searchService.autocomplete(query, limit);

    return okJson({ suggestions }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/search/trending — Get trending searches
 */
export async function handleSearchTrending(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 10;

    const trending = await searchService.getTrendingSearches(limit);

    return okJson({ trending }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/search/history — Get user search history
 */
export async function handleSearchHistory(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : 10;

    const userId = context.userId;
    const guestId = context.guestId;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    const history = await searchService.getSearchHistory(
      userId,
      guestId,
      limit,
    );

    return okJson({ history }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * DELETE /api/v1/search/history — Clear user search history
 */
export async function handleSearchHistoryClear(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;
    const guestId = context.guestId;

    if (!userId && !guestId) {
      return errorJson(
        ApiError.unauthorized('Authentication required'),
        context.requestId,
      );
    }

    await searchService.clearSearchHistory(userId, guestId);

    return okJson({ success: true }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// Register routes
register('GET', 'search', handleSearch);
register('GET', 'search/autocomplete', handleSearchAutocomplete);
register('GET', 'search/trending', handleSearchTrending);
register('GET', 'search/history', handleSearchHistory);
register('DELETE', 'search/history', handleSearchHistoryClear);
