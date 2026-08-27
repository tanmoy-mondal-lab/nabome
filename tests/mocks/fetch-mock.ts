/**
 * MSW-style fetch interceptor for unit/integration tests — no external
 * dependency. Declarative route table, JSON handling, per-test isolation.
 *
 *   mockFetchOn();
 *   mockRoute('GET', '/api/v1/products/:slug', (ctx) => ok(fixture));
 *   const res = await fetch('http://localhost/api/v1/products/x');
 *
 * Call `mockFetchOff()` in afterEach to restore the global fetch.
 */

type Params = Record<string, string>;

export interface MockRequestContext {
  /** URL without origin, e.g. /api/v1/products/necklace */
  pathname: string;
  /** Query params parsed from the URL. */
  query: URLSearchParams;
  /** Captured `:param` values from the route pattern. */
  params: Params;
  /** Raw request body (string), if any. */
  body: string | null;
  request: Request;
}

export type MockResponse = Response | Promise<Response>;

export type MockHandler = (ctx: MockRequestContext) => MockResponse;

interface MockRoute {
  method: string;
  pattern: string;
  handler: MockHandler;
}

const ROUTES: MockRoute[] = [];
let installed = false;
let originalFetch: typeof globalThis.fetch;

export function mockRoute(
  method: string,
  pattern: string,
  handler: MockHandler,
): void {
  ROUTES.push({ method: method.toUpperCase(), pattern, handler });
}

export function mockRouteOnce(
  method: string,
  pattern: string,
  handler: MockHandler,
): void {
  const route: MockRoute = {
    method: method.toUpperCase(),
    pattern,
    handler: (ctx) => {
      const i = ROUTES.indexOf(route);
      if (i !== -1) ROUTES.splice(i, 1);
      return handler(ctx);
    },
  };
  ROUTES.unshift(route);
}

export function mockFetchOn(): void {
  if (installed) return;
  originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const route = ROUTES.find(
      (r) => r.method === method && matchPath(r.pattern, url.pathname),
    );
    if (!route) {
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: {
            code: 'NOT_FOUND',
            message: `No mock for ${method} ${url.pathname}`,
          },
          meta: { requestId: 'mock', version: 'v1' },
        }),
        { status: 404, headers: JSON_HEADERS },
      );
    }
    const ctx: MockRequestContext = {
      pathname: url.pathname,
      query: url.searchParams,
      params: captureParams(route.pattern, url.pathname),
      body: await request.text(),
      request,
    };
    return route.handler(ctx);
  }) as typeof globalThis.fetch;
  installed = true;
}

export function mockFetchOff(): void {
  if (!installed) return;
  globalThis.fetch = originalFetch;
  installed = false;
  ROUTES.length = 0;
}

/** JSON success envelope matching the API contract (§5.1). */
export function ok(data: unknown, status = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      error: null,
      meta: { requestId: 'mock', version: 'v1' },
    }),
    { status, headers: JSON_HEADERS },
  );
}

/** JSON error envelope matching the API contract (§5.1). */
export function fail(code: string, message: string, status = 400): Response {
  return new Response(
    JSON.stringify({
      success: false,
      data: null,
      error: { code, message },
      meta: { requestId: 'mock', version: 'v1' },
    }),
    { status, headers: JSON_HEADERS },
  );
}

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

function matchPath(pattern: string, pathname: string): boolean {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every(
    (part, i) => part.startsWith(':') || part === pathParts[i],
  );
}

function captureParams(pattern: string, pathname: string): Params {
  const params: Params = {};
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  patternParts.forEach((part, i) => {
    if (part.startsWith(':')) params[part.slice(1)] = pathParts[i] ?? '';
  });
  return params;
}
