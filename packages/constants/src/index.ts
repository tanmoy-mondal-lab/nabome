/** Shared constant registry — no business logic, no imports from other packages. */

// ── API ───────────────────────────────────────────────────────────────────────
/** Versioned API base path (binding: B.10). */
export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

// ── Pagination (canonical: REST_API_SPECIFICATION §4.4, §5.3) ────────────────
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;
export const SEARCH_DEFAULT_PAGE_SIZE = 24;
export const SEARCH_MAX_PAGE_SIZE = 50;
export const MESSAGING_PAGE_SIZE = 50;

// ── Rate limiting (binding: B.10 + SEC §3.10) ────────────────────────────────
export const RATE_LIMIT_TIERS = {
  public: 60,
  authenticated: 120,
  admin: 300,
  apiKey: 100,
  premium: 500,
} as const;

export const RATE_LIMIT_AUTH = {
  login: { limit: 20, windowSeconds: 60 },
  register: { limit: 10, windowSeconds: 60 },
  passwordReset: { limit: 5, windowSeconds: 3600 },
  verifyEmailResend: { limit: 3, windowSeconds: 3600 },
} as const;

// ── Cache TTLs (seconds; TECH_STACK §7.1) ────────────────────────────────────
export const CACHE_TTL = {
  productList: 300,
  productDetail: 300,
  categories: 3600,
  siteSettings: 600,
  searchResults: 60,
} as const;

// ── Client-side cache (CLIENT_ARCHITECTURE_SPECIFICATION §3.1.2) ─────────────
export const QUERY_DEFAULTS = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 2,
  retryDelayCap: 30 * 1000,
} as const;

// ── Sessions & cookies (TECH_STACK §4.1) ─────────────────────────────────────
export const SESSION = {
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 7,
  csrfTokenTtlHours: 4,
  maxSessionsPerUser: 5,
} as const;

export const COOKIE = {
  session: 'nabome_session',
  csrfToken: 'csrf_token',
  guestCart: 'nabome_guest_cart',
  theme: 'nabome_theme',
} as const;

// ── Retention (binding: B.9) ─────────────────────────────────────────────────
export const RETENTION = {
  notificationDays: 90,
  sessionDays: 30,
  guestCartDays: 7,
  customerCartDays: 90,
  exportDays: 30,
  financialYears: 7,
  authAuditYears: 3,
  userActionAuditYears: 2,
  securityAuditYears: 5,
  systemAuditYears: 1,
  userPiiYearsAfterDeletion: 3,
  shippingLabelYears: 3,
} as const;

// ── Money (binding: B.7) ─────────────────────────────────────────────────────
export const CURRENCY = 'INR' as const;
export const MONEY_DECIMAL_PRECISION = [10, 2] as const;

// ── Display IDs (binding: B.7) ───────────────────────────────────────────────
export const ORDER_NUMBER_PREFIX = 'NAB';
export const DOCUMENT_ID_PREFIXES = [
  'INV',
  'ORD',
  'PKS',
  'RET',
  'RFD',
  'STL',
  'FIN',
  'EXP',
  'AUD',
  'CST',
  'SST',
  'CUS',
  'CRT',
  'PRC',
  'SHL',
] as const;

// ── Inventory (binding: B.6) ─────────────────────────────────────────────────
export const LOW_STOCK_THRESHOLD_DEFAULT = 10;

// ── Media (TECH_STACK §5.1) ──────────────────────────────────────────────────
export const MEDIA = {
  maxFileSizeBytes: 10 * 1024 * 1024,
  maxDimensions: 4000,
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ],
} as const;

// ── Storage (STORAGE_ENGINE_ARCHITECTURE §11.6) ──────────────────────────────
export const STORAGE_BUCKET_DEFAULT = 'nabome-storage';
export const STORAGE_FOLDER_ROOT = 'nabome-storage';

// ── KV namespace prefixes ────────────────────────────────────────────────────
export const KV_PREFIX = {
  cache: 'cache:',
  rateLimit: 'rl:',
  session: 'session:',
  config: 'config:',
  flags: 'flags:',
} as const;

// ── Queues ───────────────────────────────────────────────────────────────────
export const QUEUE = {
  events: 'nabome-events',
  eventsDlq: 'nabome-events-dlq',
  emails: 'nabome-emails',
} as const;

// ── Performance budgets (FRONTEND_PERFORMANCE spec §1.2) ─────────────────────
export const PERF_BUDGET = {
  initialJsKb: 200,
  routeJsKb: 350,
  cssKb: 50,
  heroKb: 150,
  productCardKb: 50,
  thumbnailKb: 15,
} as const;

// ── Misc business constants ──────────────────────────────────────────────────
export const MAX_ORDER_ITEMS = 100;
export const MAX_REVIEW_LENGTH = 2000;
export const MAX_ADDRESS_LABEL_LENGTH = 40;
