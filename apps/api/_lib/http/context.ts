/**
 * Request-scoped context — assembled by the middleware, consumed by handlers.
 */
import type { RequestMeta } from '@nabome/api-contracts';

import type { Env } from '../env.ts';

export interface RequestContext {
  env: Env;
  /** Canonical request id (also echoed in every envelope). */
  requestId: string;
  /** Origin of the caller (CORS origin), when known. */
  origin: string | null;
  /** Supabase session access token, when present. */
  accessToken: string | null;
  /** True for state-changing methods (CSRF enforced). */
  isMutation: boolean;
  /** HTTP method in uppercase. */
  method: string;
  meta: RequestMeta;
  /** User ID from authenticated session, when present. */
  userId?: string;
  /** Guest ID for unauthenticated users, when present. */
  guestId?: string;
  /** User role from authenticated session, when present. */
  userRole?: string;
  /** Session ID from authenticated session, when present. */
  sessionId?: string;
}
