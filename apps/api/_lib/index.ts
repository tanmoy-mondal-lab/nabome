/**
 * Single barrel for API internals (FOLDER_ARCHITECTURE §10.4).
 * Handlers import only from here (or their own domain) — never across
 * handler domains, never deep paths into sibling libs.
 */
export type { Env } from './env.ts';
export type { RequestContext } from './http/context.ts';
export { ApiError, isApiError } from './http/errors.ts';
export {
  createdJson,
  errorJson,
  failure,
  json,
  list,
  okJson,
  success,
} from './http/response.ts';
export { getLogger, withRequestId } from './logger.ts';
export type { Logger } from './logger.ts';
export { checkRateLimit, clientKey } from './ratelimit.ts';
export type { RateLimitResult, RateLimitTier } from './ratelimit.ts';
export { resolveRequestId } from './request-id.ts';
export {
  allowedOrigins,
  applyCors,
  applySecurityHeaders,
  isPreflight,
  resolveOrigin,
} from './security.ts';
export {
  authenticate,
  enforceCsrf,
  extractBearerToken,
  readCsrfToken,
} from './auth.ts';
export type { SessionPrincipal } from './auth.ts';
export { parseJsonBody, validate } from './validation.ts';
