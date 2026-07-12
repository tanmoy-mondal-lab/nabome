import { vi } from 'vitest';

// Standard Prisma delegate methods. Every model delegate exposes all of these
// as vi.fn() mocks so handlers can call any method without "not a function" errors.
const DELEGATE_METHODS = [
  'findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow',
  'findMany', 'create', 'createMany', 'update', 'upsert', 'delete',
  'deleteMany', 'updateMany', 'aggregate', 'groupBy', 'count',
  'findRaw', 'aggregateRaw', 'runCommandRaw',
];

function createDelegate() {
  const delegate: Record<string, any> = {};
  for (const method of DELEGATE_METHODS) {
    delegate[method] = vi.fn().mockResolvedValue(undefined);
  }
  // Sensible empty defaults so handlers that rely on these don't 500 by default.
  delegate.findMany = vi.fn().mockResolvedValue([]);
  delegate.findFirst = vi.fn().mockResolvedValue(null);
  delegate.findUnique = vi.fn().mockResolvedValue(null);
  delegate.findFirstOrThrow = vi.fn().mockResolvedValue(null);
  delegate.findUniqueOrThrow = vi.fn().mockResolvedValue(null);
  delegate.count = vi.fn().mockResolvedValue(0);
  delegate.create = vi.fn().mockResolvedValue({});
  delegate.createMany = vi.fn().mockResolvedValue({ count: 0 });
  delegate.update = vi.fn().mockResolvedValue({});
  delegate.upsert = vi.fn().mockResolvedValue({});
  delegate.delete = vi.fn().mockResolvedValue({});
  delegate.deleteMany = vi.fn().mockResolvedValue({ count: 0 });
  delegate.updateMany = vi.fn().mockResolvedValue({ count: 0 });
  delegate.aggregate = vi.fn().mockResolvedValue({});
  delegate.groupBy = vi.fn().mockResolvedValue([]);
  return delegate;
}

// Canonical model names exactly as exposed by the generated Prisma client
// (node_modules/.prisma/client). These match the model names in prisma/schema.prisma.
const MODEL_NAMES = [
  'addresses', 'analytics_events', 'announcement_bars', 'api_keys', 'auth_sessions',
  'brands', 'campaigns', 'cart_items', 'carts', 'categories', 'collections',
  'contact_submissions', 'coupon_redemptions', 'coupons', 'faqs', 'footer_sections',
  'homepage_sections', 'inventory_alerts', 'inventory_movements', 'job_queue',
  'login_attempts', 'lookbook_items', 'lookbooks', 'media_assets', 'media_audit_logs',
  'navigation_menus', 'newsletter_subscribers', 'notification_templates', 'notifications',
  'order_items', 'order_status_history', 'orders', 'page_templates', 'product_attributes',
  'product_images', 'product_labels', 'product_labels_products', 'product_tags',
  'product_tags_products', 'product_variants', 'products', 'profiles', 'refunds',
  'related_products', 'return_requests', 'reviews', 'search_history', 'site_settings',
  'size_guides', 'social_media_links', 'static_pages', 'subcategories', 'support_ticket_replies',
  'support_tickets', 'trending_searches', 'user_action_logs', 'verification_attempts',
  'webhook_events', 'wishlist_items',
];

// Legacy singular aliases. Existing tests reference the old singular mock shapes
// (e.g. mockPrisma.product); they are aliased to the same delegate the handlers
// actually read (prisma.products) so both sides resolve to one object.
const LEGACY_ALIASES: Record<string, string> = {
  product: 'products',
  productVariant: 'product_variants',
  productImage: 'product_images',
  address: 'addresses',
  wishlistItem: 'wishlist_items',
  review: 'reviews',
  coupon: 'coupons',
  couponRedemption: 'coupon_redemptions',
  relatedProduct: 'related_products',
  order: 'orders',
  orderItem: 'order_items',
  orderStatusHistory: 'order_status_history',
  cart: 'carts',
  userActionLog: 'user_action_logs',
  notification: 'notifications',
  mediaAsset: 'media_assets',
  authSession: 'auth_sessions',
  loginAttempt: 'login_attempts',
};

// Shared Prisma mock factory
export function createMockPrisma() {
  const mock: Record<string, any> = {};
  for (const name of MODEL_NAMES) {
    mock[name] = createDelegate();
  }
  for (const [legacy, canonical] of Object.entries(LEGACY_ALIASES)) {
    mock[legacy] = mock[canonical];
  }
  mock.$transaction = vi.fn(async (operations: unknown[]) =>
    Array.isArray(operations) ? Promise.all(operations) : operations,
  );
  mock.$connect = vi.fn();
  mock.$disconnect = vi.fn();
  mock.$use = vi.fn();
  mock.$on = vi.fn();
  mock.$executeRaw = vi.fn().mockResolvedValue(undefined);
  mock.$queryRaw = vi.fn().mockResolvedValue([]);
  return mock;
}

// Helper to create a Request with JSON body
export function makeRequest(method: string, url: string, body?: unknown): Request {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  return new Request(`http://localhost${url}`, opts);
}

// Helper to create a RequestContext
export function makeContext(userId?: string, env?: any) {
  return {
    userId,
    userRole: userId ? 'customer' : undefined,
    env: env ?? {},
  };
}

// Parse JSON from Response
export async function parseResponse(res: Response) {
  return res.json();
}
