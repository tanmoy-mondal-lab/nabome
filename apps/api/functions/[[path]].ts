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
  resetStalePool,
  withRequestId,
} from '../_lib/index.ts';

interface Data {
  requestId: string;
  context: RequestContext;
}

const VERSION_PREFIX = `/api/${API_VERSION}`;
let registered = false;

const HANDLER_TIMEOUT_MS = 45000;

function withHandlerTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error('DB_TIMEOUT')), HANDLER_TIMEOUT_MS),
    ),
  ]);
}

const TRANSIENT_DB_ERRORS = [
  'timeout',
  'timed out',
  'p1001',
  "can't reach database",
  'connection refused',
  'econnrefused',
  'etimedout',
  'pool',
];

function isTransientDbError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return TRANSIENT_DB_ERRORS.some((s) => lower.includes(s));
}

async function isTimeoutResponse(r: Response): Promise<boolean> {
  if (r.status !== 422 && r.status !== 500) return false;
  try {
    const t = await r.clone().text();
    return t.includes('timeout') || t.includes('temporarily');
  } catch {
    return false;
  }
}

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

  let lastRun: (() => Promise<Response>) | null = null;

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
            // Buffer mutation bodies once so transient-DB retries can replay
            // the request; re-running a handler on the same Request would
            // fail with "Body has already been used".
            let bufferedBody: ArrayBuffer | null = null;
            if (method !== 'GET' && method !== 'HEAD') {
              try {
                bufferedBody = await request.clone().arrayBuffer();
              } catch {
                bufferedBody = null;
              }
            }
            const makeReq = (): Request =>
              bufferedBody
                ? new Request(request, { body: bufferedBody })
                : request;
            const run = () =>
              withHandlerTimeout(
                Promise.resolve(handler(makeReq(), context, params)),
              );
            lastRun = run;
            try {
              const resp = await run();
              if (await isTimeoutResponse(resp)) {
                logger.warn({ path, method }, 'Retrying timeout response');
                resetStalePool();
                await new Promise((r) => setTimeout(r, 500));
                const retryResp = await run().catch(() => null);
                if (retryResp && !(await isTimeoutResponse(retryResp)))
                  return retryResp;
                if (retryResp) return retryResp;
              }
              return resp;
            } catch (e) {
              const msg = (e as Error).message;
              if (msg === 'DB_TIMEOUT' || msg.includes('timeout')) {
                logger.warn({ path, method, error: msg }, 'Retrying handler');
                resetStalePool();
                await new Promise((r) => setTimeout(r, 500));
                try {
                  const retryResp = await run();
                  if (await isTimeoutResponse(retryResp)) {
                    return retryResp;
                  }
                  return retryResp;
                } catch (e2) {
                  logger.error(
                    { path, method, error: (e2 as Error).message },
                    'Handler retry failed',
                  );
                  return errorJson(
                    ApiError.internal('Database temporarily unavailable'),
                    requestId,
                  );
                }
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
    const message = error instanceof Error ? error.message : String(error);
    if (lastRun && isTransientDbError(message)) {
      const run = lastRun;
      logger.warn(
        { path, method, error: message },
        'Retrying transient DB error',
      );
      resetStalePool();
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const retryResp = await run();
        if (await isTimeoutResponse(retryResp)) {
          logger.warn({ path, method }, 'Retrying timeout response');
          await new Promise((r) => setTimeout(r, 500));
          const retryResp2 = await run().catch(() => null);
          if (retryResp2) return retryResp2;
        }
        return retryResp;
      } catch (e2) {
        logger.error(
          {
            error: e2 instanceof Error ? e2.message : String(e2),
            path,
            method,
          },
          'Transient DB retry failed',
        );
      }
    }
    logger.error(
      {
        error: message,
        path,
        method,
      },
      'Unhandled error',
    );
    return errorJson(ApiError.internal(), requestId);
  }
};
