import type { Env } from "./env";

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours in seconds

interface CachedResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

function getCacheBinding(env: Env): Env["CACHE"] | null {
  const cache = env.CACHE;
  if (cache && typeof cache.get === "function" && typeof cache.put === "function") {
    return cache;
  }
  return null;
}

function cacheKey(key: string): string {
  return `idempotency:${key}`;
}

/**
 * Check CACHE for an existing response for this idempotency key.
 * If found, returns the cached Response; otherwise returns null.
 */
export async function getCachedResponse(key: string, env: Env): Promise<Response | null> {
  const kv = getCacheBinding(env);
  if (!kv) return null;

  try {
    const raw = await kv.get(cacheKey(key));
    if (!raw) return null;

    const cached: CachedResponse = JSON.parse(raw);
    return new Response(cached.body, {
      status: cached.status,
      headers: { ...cached.headers, "X-Idempotency-Key": key },
    });
  } catch {
    return null;
  }
}

/**
 * Store a Response in CACHE for the given idempotency key.
 */
export async function storeResponse(key: string, response: Response, env: Env): Promise<void> {
  const kv = getCacheBinding(env);
  if (!kv) return;

  try {
    const body = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      headers[k] = v;
    });

    const cached: CachedResponse = {
      status: response.status,
      body,
      headers,
    };

    await kv.put(cacheKey(key), JSON.stringify(cached), {
      expirationTtl: IDEMPOTENCY_TTL,
    });

    // Return a new Response since we consumed the original body
  } catch {
    // Silent failure - KV write error
  }
}

/**
 * Wraps a handler with idempotency logic.
 * - Checks CACHE for an existing response with this key
 * - If found, returns cached response
 * - If not, executes handler, caches response, returns it
 */
export async function withIdempotency(
  key: string | null,
  env: Env,
  handler: () => Promise<Response>
): Promise<Response> {
  const idempotencyKey = key || crypto.randomUUID();

  const cached = await getCachedResponse(idempotencyKey, env);
  if (cached) {
    return cached;
  }

  const response = await handler();

  // Only cache successful responses
  if (response.status >= 200 && response.status < 300) {
    const body = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      headers[k] = v;
    });

    const kv = getCacheBinding(env);
    if (kv) {
      try {
        const cachedData: CachedResponse = {
          status: response.status,
          body,
          headers,
        };
        await kv.put(cacheKey(idempotencyKey), JSON.stringify(cachedData), {
          expirationTtl: IDEMPOTENCY_TTL,
        });
      } catch {
        // Silent failure
      }
    }

    const newResponse = new Response(body, {
      status: response.status,
      headers: { ...headers, "X-Idempotency-Key": idempotencyKey },
    });
    return newResponse;
  }

  // Non-successful responses don't get cached, but we add the key header
  const newResponse = new Response(response.body, {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  });
  newResponse.headers.set("X-Idempotency-Key", idempotencyKey);
  return newResponse;
}
