import { ERROR_CODES, ERROR_HTTP_STATUS } from '@nabome/api-contracts';

import type { RequestContext } from '../_lib/http/context.ts';
import { okJson } from '../_lib/http/response.ts';

/**
 * GET /meta/errors — publishes the canonical error registry so clients can
 * render server-driven messages (API_SERVICE_ARCHITECTURE §10.4).
 */
export function handleErrors(
  _request: Request,
  context: RequestContext,
): Response {
  return okJson(
    {
      count: ERROR_CODES.length,
      errors: ERROR_CODES.map((code) => ({
        code,
        httpStatus: ERROR_HTTP_STATUS[code],
      })),
    },
    context.requestId,
  );
}
