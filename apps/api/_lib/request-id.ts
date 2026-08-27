import { randomUUID } from 'node:crypto';

import type { Env } from './env.ts';

const HEADER = 'x-request-id';

/** Generate or reuse a request id. */
export function resolveRequestId(request: Request): string {
  const incoming = request.headers.get(HEADER);
  if (incoming && incoming.length <= 64 && /^[a-zA-Z0-9\-_]+$/.test(incoming)) {
    return incoming;
  }
  return randomUUID();
}

/** Env-aware resolver (kept separate so the header rule stays testable). */
export function resolveRequestIdWithEnv(request: Request, env: Env): string {
  void env;
  return resolveRequestId(request);
}
