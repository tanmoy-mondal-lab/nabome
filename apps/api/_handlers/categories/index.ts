/**
 * Category API Handlers
 * Source: REST_API_SPECIFICATION.md, CATALOG_ARCHITECTURE.md (binding)
 *
 * Public read endpoints for categories.
 */

import { categoryService } from '../../_lib/categories/service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/categories — List categories with filtering and pagination
 */
export async function handleCategoriesList(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const result = await categoryService.list({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      parentId: queryParams.parentId,
      isActive:
        queryParams.isActive === 'true'
          ? true
          : queryParams.isActive === 'false'
            ? false
            : undefined,
      isHidden:
        queryParams.isHidden === 'true'
          ? true
          : queryParams.isHidden === 'false'
            ? false
            : undefined,
    });

    return okJson(
      {
        categories: result.categories,
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
 * GET /api/v1/categories/{id} — Get a single category by ID
 */
export async function handleCategoryGet(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { id } = params;

    if (!id) {
      return errorJson(
        ApiError.validation('Category ID is required'),
        context.requestId,
      );
    }

    const category = await categoryService.getById(id);

    if (!category) {
      return errorJson(
        ApiError.notFound('Category not found'),
        context.requestId,
      );
    }

    // Only return active categories for public access
    if (!category.isActive) {
      return errorJson(
        ApiError.notFound('Category not found'),
        context.requestId,
      );
    }

    return okJson(category, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/categories/slug/{slug} — Get a single category by slug
 */
export async function handleCategoryGetBySlug(
  _request: Request,
  context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const { slug } = params;

    if (!slug) {
      return errorJson(
        ApiError.validation('Category slug is required'),
        context.requestId,
      );
    }

    const category = await categoryService.getBySlug(slug);

    if (!category) {
      return errorJson(
        ApiError.notFound('Category not found'),
        context.requestId,
      );
    }

    // Only return active categories for public access
    if (!category.isActive) {
      return errorJson(
        ApiError.notFound('Category not found'),
        context.requestId,
      );
    }

    return okJson(category, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/categories/tree — Get category tree (hierarchical structure)
 */
export async function handleCategoriesTree(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const categories = await categoryService.getTree();

    return okJson({ categories }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

/**
 * GET /api/v1/categories/root — Get root categories (no parent)
 */
export async function handleCategoriesRoot(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const categories = await categoryService.getRoot();

    return okJson({ categories }, context.requestId);
  } catch (error) {
    if (error instanceof Error) {
      return errorJson(ApiError.validation(error.message), context.requestId);
    }
    return errorJson(ApiError.validation('Invalid request'), context.requestId);
  }
}

// Register routes
register('GET', 'categories', handleCategoriesList);
register('GET', 'categories/{id}', handleCategoryGet);
register('GET', 'categories/slug/{slug}', handleCategoryGetBySlug);
register('GET', 'categories/tree', handleCategoriesTree);
register('GET', 'categories/root', handleCategoriesRoot);
