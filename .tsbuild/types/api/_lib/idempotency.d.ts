import type { Env } from "./env";
/**
 * Check CACHE for an existing response for this idempotency key.
 * If found, returns the cached Response; otherwise returns null.
 */
export declare function getCachedResponse(key: string, env: Env, userId?: string): Promise<Response | null>;
/**
 * Store a Response in CACHE for the given idempotency key.
 */
export declare function storeResponse(key: string, response: Response, env: Env, userId?: string): Promise<void>;
/**
 * Wraps a handler with idempotency logic.
 * - Checks CACHE for an existing response with this key
 * - If found, returns cached response
 * - If not, executes handler, caches response, returns it
 */
export declare function withIdempotency(key: string | null, env: Env, handler: () => Promise<Response>, userId?: string): Promise<Response>;
