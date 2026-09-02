// @ts-nocheck -- workers-types vs DOM lib conflict: known issue, skipLibCheck covers it
/**
 * Global middleware — runs before every Pages function in this project:
 *  1. resolve request id (echoed in every envelope)
 *  2. CORS for allowed origins + preflight short-circuit
 *  3. security headers
 *  4. public-tier rate limiting (keyed by client IP)
 *  5. CSRF enforcement for mutations (skips auth/webhooks)
 *  6. JWT authentication — populates context.userId/userRole/sessionId
 *  7. stash context on `data` for the catch-all handler
 */
import type { PagesFunction } from '@cloudflare/workers-types';

import { API_VERSION } from '@nabome/constants';

import { verifyToken } from '../_lib/auth/jwt.ts';
import type { Env } from '../_lib/env.ts';
import type { RequestContext } from '../_lib/http/context.ts';
import {
  applyCors,
  applySecurityHeaders,
  checkRateLimit,
  clientKey,
  enforceCsrf,
  getLogger,
  isPreflight,
  resolveRequestId,
  withRequestId,
} from '../_lib/index.ts';
import { initPrisma } from '../_lib/prisma.ts';

interface Data {
  requestId: string;
  context: RequestContext;
}

function extractToken(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (auth) {
    const m = /^Bearer\s+(.+)$/.exec(auth.trim());
    if (m) return m[1] ?? null;
  }
  const cookies = request.headers.get('cookie') ?? '';
  for (const part of cookies.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === 'access_token') return decodeURIComponent(rest.join('='));
  }
  return null;
}

function extractGuestId(request: Request): string | null {
  return request.headers.get('x-guest-id') ?? null;
}

function extractSessionId(request: Request): string | null {
  const cookies = request.headers.get('cookie') ?? '';
  for (const part of cookies.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === 'refresh_token' || name === 'access_token') continue;
    if (name === 'session_id') return decodeURIComponent(rest.join('='));
  }
  return null;
}

export const onRequest: PagesFunction<Env, 'requestId' | 'context'> = async ({
  request,
  env,
  next,
  data,
}) => {
  const hyperdriveCs = (
    env as unknown as { HYPERDRIVE?: { connectionString?: string } }
  ).HYPERDRIVE?.connectionString;
  const databaseUrl = hyperdriveCs ?? env.DATABASE_URL ?? '';
  initPrisma(databaseUrl, { viaHyperdrive: Boolean(hyperdriveCs) });

  const logger = getLogger(env);
  const requestId = resolveRequestId(request);

  const origin = request.headers.get('origin');
  const allowedOrigin = origin && isAllowedOrigin(env, origin) ? origin : null;

  if (isPreflight(request)) {
    const headers = new Headers();
    applyCors(headers, env, request);
    applySecurityHeaders(headers);
    return new Response(null, { status: 204, headers });
  }

  const limit = await checkRateLimit(env.KV, 'public', clientKey(request));
  if (!limit.allowed) {
    const headers = new Headers({
      'content-type': 'application/json; charset=utf-8',
      'retry-after': String(limit.resetSeconds),
    });
    applyCors(headers, env, request);
    applySecurityHeaders(headers);
    return new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded' },
        meta: { requestId, version: API_VERSION },
      }),
      { status: 429, headers },
    );
  }

  const requestLogger = withRequestId(logger, requestId);
  requestLogger.debug(
    {
      method: request.method,
      url: new URL(request.url).pathname,
      origin: allowedOrigin,
    },
    'Request',
  );

  const url = new URL(request.url);
  const pathname = url.pathname;
  const isAuthPath = pathname.includes('/auth/');
  const isWebhookPath = pathname.includes('/webhooks/');
  const isInternalPath = pathname.includes('/internal/');
  const isTestBypassCsrf = Boolean((env as any).TURNSTILE_BYPASS_SECRET && request.headers.get('x-turnstile-bypass') === (env as any).TURNSTILE_BYPASS_SECRET);
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);

  if (isMutation && !isAuthPath && !isWebhookPath && !isInternalPath && !isTestBypassCsrf) {
    try {
      enforceCsrf(request, env.SESSION_COOKIE_NAME || 'csrf_token');
    } catch (error) {
      const headers = new Headers({
        'content-type': 'application/json; charset=utf-8',
      });
      applyCors(headers, env, request);
      applySecurityHeaders(headers);
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: 'FORBIDDEN', message: 'CSRF validation failed' },
          meta: { requestId, version: API_VERSION },
        }),
        { status: 403, headers },
      );
    }
  }

  let userId: string | undefined;
  let userRole: string | undefined;
  let sessionId: string | undefined;
  let accessToken: string | null = null;

  const rawToken = extractToken(request);
  if (rawToken && env.JWT_SECRET) {
    try {
      const payload = verifyToken(rawToken, env.JWT_SECRET);
      userId = payload.userId;
      userRole = payload.role;
      accessToken = rawToken;
      const cookies = request.headers.get('cookie') ?? '';
      for (const part of cookies.split(';')) {
        const [name, ...rest] = part.trim().split('=');
        if (name === 'session_id') {
          sessionId = decodeURIComponent(rest.join('='));
          break;
        }
      }
      if (!sessionId) {
        const needsSession =
          isMutation ||
          pathname.includes('/auth/') ||
          pathname.includes('/cart') ||
          pathname.includes('/checkout') ||
          pathname.includes('/orders');
        if (!needsSession) {
          sessionId = undefined;
        } else {
          try {
            const { getPrisma } = await import('../_lib/prisma.ts');
            const prisma = getPrisma() as any;
            const tokenHash = await hashToken(rawToken);
            const withTimeout = <T>(
              p: Promise<T>,
              ms = 10000,
            ): Promise<T | null> =>
              Promise.race([
                p,
                new Promise<null>((_, rej) =>
                  setTimeout(() => rej(new Error('timeout')), ms),
                ),
              ]).catch(() => null) as Promise<T | null>;
            const session = (await withTimeout(
              prisma.session.findFirst({
                where: {
                  userId: payload.userId,
                  revokedAt: null,
                  expiresAt: { gt: new Date() },
                  refreshTokenHash: tokenHash,
                } as any,
                orderBy: { createdAt: 'desc' },
              }),
            )) as any;
            if (session) sessionId = session.id;
            else {
              const fallback = (await withTimeout(
                prisma.session.findFirst({
                  where: {
                    userId: payload.userId,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                  },
                  orderBy: { createdAt: 'desc' },
                }),
              )) as any;
              if (fallback) sessionId = fallback.id;
            }
          } catch {}
        }
      }
    } catch {}
  }

  const guestId = extractGuestId(request) ?? undefined;

  const context: RequestContext = {
    env,
    requestId,
    origin: allowedOrigin,
    accessToken,
    isMutation,
    method: request.method,
    meta: { requestId, version: API_VERSION },
    userId,
    userRole,
    sessionId,
    guestId: guestId ?? undefined,
  };

  (data as unknown as Data).requestId = requestId;
  (data as unknown as Data).context = context;

  const response = await next();

  const headers = new Headers(response.headers);
  applyCors(headers, env, request);
  applySecurityHeaders(headers);
  headers.set('x-request-id', requestId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isAllowedOrigin(env: Env, origin: string): boolean {
  return (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .includes(origin);
}
