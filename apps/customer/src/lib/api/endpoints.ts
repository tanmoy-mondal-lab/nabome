/**
 * API endpoint constants (kebab-case, REST_API_SPECIFICATION §2.4).
 * Path params use `{param}` placeholders — callers interpolate.
 */
export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    passwordReset: '/auth/password-reset',
    verifyEmail: '/auth/verify-email',
    profile: '/auth/profile',
  },
  products: {
    list: '/products',
    detail: '/products/{id}',
    search: '/products/search',
    reviews: '/products/{id}/reviews',
  },
  cart: {
    get: '/cart',
    add: '/cart/add',
    item: '/cart/{itemId}',
    sync: '/cart/sync',
  },
  checkout: {
    createOrder: '/checkout/create-order',
    verifyPayment: '/checkout/verify-payment',
  },
  orders: {
    list: '/orders',
    detail: '/orders/{id}',
    tracking: '/orders/{id}/tracking',
    cancel: '/orders/{id}/cancel',
    returnRequest: '/orders/{id}/return',
  },
  wishlist: {
    list: '/wishlist',
    add: '/wishlist',
    item: '/wishlist/{id}',
  },
  addresses: {
    list: '/addresses',
    create: '/addresses',
    update: '/addresses/{id}',
    delete: '/addresses/{id}',
  },
} as const;

/** Interpolate a `{param}` path template. */
export function withParams(
  path: string,
  params: Record<string, string | number>,
): string {
  return path.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key]));
}
