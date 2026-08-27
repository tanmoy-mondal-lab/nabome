/**
 * Route registry — single source of truth for API routes
 * (FOLDER_ARCHITECTURE: _handlers never import other handler domains).
 * Key format: `METHOD path` with `{param}` placeholders, paths relative to
 * `/api/v1`.
 *
 * Foundation ships health + meta. Each domain prompt appends its own module
 * via `register`.
 */
import type { RequestContext } from '../_lib/http/context.ts';

export type RouteHandler = (
  request: Request,
  context: RequestContext,
  params: Record<string, string>,
) => Promise<Response> | Response;

const registry = new Map<string, RouteHandler>();

export function register(
  method: string,
  path: string,
  handler: RouteHandler,
): void {
  registry.set(`${method.toUpperCase()} ${path}`, handler);
}

export function lookup(method: string, path: string): RouteHandler | undefined {
  return registry.get(`${method.toUpperCase()} ${path}`);
}

export function registeredRoutes(): string[] {
  return [...registry.keys()].sort();
}

/**
 * Planned route surface (bound by REST_API_SPECIFICATION). Handlers land
 * with their domain prompts; until then these paths 404.
 */
export const PLANNED_ROUTES: ReadonlyArray<readonly [string, string]> = [
  ['POST', 'auth/register'],
  ['POST', 'auth/login'],
  ['POST', 'auth/logout'],
  ['POST', 'auth/refresh'],
  ['POST', 'auth/password-reset'],
  ['POST', 'auth/verify-email'],
  ['GET', 'auth/profile'],
  ['GET', 'products'],
  ['GET', 'products/{id}'],
  ['GET', 'products/search'],
  ['GET', 'products/{id}/reviews'],
  ['GET', 'categories'],
  ['GET', 'collections'],
  ['GET', 'brands'],
  ['GET', 'cart'],
  ['POST', 'cart/add'],
  ['PATCH', 'cart/{itemId}'],
  ['DELETE', 'cart/{itemId}'],
  ['POST', 'cart/sync'],
  ['POST', 'checkout/create-order'],
  ['POST', 'checkout/verify-payment'],
  ['GET', 'orders'],
  ['GET', 'orders/{id}'],
  ['GET', 'orders/{id}/tracking'],
  ['POST', 'orders/{id}/cancel'],
  ['POST', 'orders/{id}/return'],
  ['GET', 'wishlist'],
  ['POST', 'wishlist'],
  ['DELETE', 'wishlist/{id}'],
  ['GET', 'addresses'],
  ['POST', 'addresses'],
  ['PATCH', 'addresses/{id}'],
  ['DELETE', 'addresses/{id}'],
  ['GET', 'notifications'],
  ['PATCH', 'notifications/{id}'],
  ['POST', 'webhooks'],
  // Shipping & Fulfillment Routes
  ['GET', 'shipments'],
  ['GET', 'shipments/{id}'],
  ['POST', 'shipments'],
  ['PATCH', 'shipments/{id}/status'],
  ['DELETE', 'shipments/{id}'],
  ['GET', 'orders/{orderId}/shipments'],
  ['GET', 'shipments/{id}/tracking'],
  ['GET', 'tracking/{trackingNumber}'],
  ['POST', 'shipments/{id}/tracking/events'],
  ['GET', 'fulfillment/queue'],
  ['GET', 'fulfillment/{id}'],
  ['PATCH', 'fulfillment/{id}'],
  ['POST', 'fulfillment'],
  ['GET', 'carriers'],
  ['GET', 'carriers/{code}'],
  ['POST', 'carriers'],
  ['PATCH', 'carriers/{code}'],
  ['POST', 'carriers/rates'],
] as const;
