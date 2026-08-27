/**
 * Homepage API Handler for V1
 * Returns featured, new, and trending products for the homepage
 */

import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { okJson, errorJson } from '../../_lib/http/response.ts';
import { productService } from '../../_lib/products/service.ts';
import { register } from '../register.ts';

/**
 * GET /api/v1/homepage — Get homepage data
 * Returns featured, new arrivals, and trending products
 */
export async function handleHomepage(
  _request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const [featured, newProducts, trending] = await Promise.all([
      productService.getFeatured(8),
      productService.getNew(8),
      productService.getTrending(8),
    ]);

    return okJson(
      {
        featured,
        new: newProducts,
        trending,
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

// Register route
register('GET', 'homepage', handleHomepage);
