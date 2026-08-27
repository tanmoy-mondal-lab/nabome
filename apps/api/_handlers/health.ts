import type { RequestContext } from '../_lib/http/context.ts';
import { okJson } from '../_lib/http/response.ts';

/**
 * GET /health — liveness probe (API_SERVICE_ARCHITECTURE §11.2).
 */
export function handleHealth(
  _request: Request,
  context: RequestContext,
): Response {
  return okJson(
    {
      status: 'ok',
      environment: context.env.ENVIRONMENT,
      timestamp: new Date().toISOString(),
    },
    context.requestId,
  );
}
