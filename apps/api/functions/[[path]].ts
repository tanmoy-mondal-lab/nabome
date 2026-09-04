/**
 * Catch-all router — dispatches every `/api/v1/**` request to the handler
 * registry (API_SERVICE_ARCHITECTURE §9). Sibling functions (health, ...)
 * take precedence over this catch-all in Pages.
 */
import { API_VERSION } from '@nabome/constants';

import { registerHandlers } from '../_handlers/index.ts';
import { registeredRoutes, lookup } from '../_handlers/register.ts';
import type { Env } from '../_lib/env.ts';
import type { RequestContext } from '../_lib/http/context.ts';
import {
  ApiError,
  errorJson,
  getLogger,
  okJson,
  withRequestId,
} from '../_lib/index.ts';

interface Data {
  requestId: string;
  context: RequestContext;
}

const VERSION_PREFIX = `/api/${API_VERSION}`;
let registered = false;

function ensureRegistered(): void {
  if (!registered) {
    registerHandlers();
    registered = true;
  }
}

/** Match `/products/{id}` against a concrete path with params capture. */
function matchRoute(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) {
    return null;
  }
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    if (patternPart?.startsWith('{') && patternPart.endsWith('}')) {
      if (!pathPart) {
        return null;
      }
      params[patternPart.slice(1, -1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return null;
    }
  }
  return params;
}

export const onRequest: PagesFunction<Env, 'requestId' | 'context'> = async ({
  request,
  env,
  data,
}) => {
  ensureRegistered();

  const { requestId, context } = data as unknown as Data;
  const logger = withRequestId(getLogger(env), requestId);

  const url = new URL(request.url);
  const rawPath = url.pathname;

  if (!rawPath.startsWith(VERSION_PREFIX)) {
    return errorJson(ApiError.notFound('Route not found'), requestId);
  }

  const path = rawPath.slice(VERSION_PREFIX.length).replace(/^\/+|\/+$/g, '');
  const method = request.method.toUpperCase();

  try {
    if (method === 'GET' && path === 'meta/routes') {
      return okJson({ routes: registeredRoutes() }, requestId);
    }

    for (const route of registeredRoutes()) {
      const [routeMethod, routePath] = route.split(' ');
      if (routeMethod === method) {
        const params = matchRoute(routePath ?? '', path);
        if (params) {
          const handler = lookup(method, routePath ?? '');
          if (handler) {
            const withTimeout = <T>(p: Promise<T>, ms = 8000): Promise<T> =>
              Promise.race([
                p,
                new Promise<never>((_, rej) =>
                  setTimeout(() => rej(new Error('DB_TIMEOUT')), ms),
                ),
              ]);
            try {
              return await withTimeout(
                Promise.resolve(handler(request, context, params)),
              );
            } catch (e) {
              if ((e as Error).message === 'DB_TIMEOUT') {
                logger.error({ path, method }, 'Handler timeout');
                return errorJson(
                  ApiError.internal('Database temporarily unavailable'),
                  requestId,
                );
              }
              throw e;
            }
          }
        }
      }
    }

    return errorJson(ApiError.notFound('Route not found'), requestId);
  } catch (error) {
    if (error instanceof ApiError) {
      return errorJson(error, requestId);
    }
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        path,
        method,
      },
      'Unhandled error',
    );
    return errorJson(ApiError.internal(), requestId);
  }
};
