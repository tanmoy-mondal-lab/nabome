/**
 * Nabome API contracts — binding envelope, error registry and meta shapes.
 * Source: REST_API_SPECIFICATION.md §5.1/§6.7, API_SERVICE_ARCHITECTURE.md §10.4,
 * MASTER_ARCHITECTURE_BLUEPRINT.md B.10. Pure package: no zod, no framework.
 */

// ── Error registry ────────────────────────────────────────────────────────────

/**
 * Canonical machine-readable error codes. Each code maps to exactly one HTTP
 * status via ERROR_HTTP_STATUS. Published via GET /api/v1/meta/errors.
 */
export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'INVALID_SORT',
  'AUTH_REQUIRED',
  'UNAUTHORIZED',
  'SESSION_EXPIRED',
  'ACCOUNT_LOCKED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'INSUFFICIENT_STOCK',
  'RATE_LIMITED',
  'TURNSTILE_FAILED',
  'FILE_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'CONFIG_KEY_READONLY',
  'API_KEY_INVALID',
  'PAYMENT_REQUIRED',
  // S16 Payments (REST_API_SPECIFICATION §7.16)
  'PAYMENT_FAILED',
  'PAYMENT_AMOUNT_MISMATCH',
  'INVALID_PAYMENT_SIGNATURE',
  'PAYMENT_NOT_CAPTURED',
  'PAYMENT_EXPIRED',
  'PAYMENT_METHOD_UNAVAILABLE',
  'REFUND_EXCEEDS_PAYMENT',
  'REFUND_WINDOW_EXPIRED',
  'REFUND_REASON_REQUIRED',
  'ALREADY_REFUNDED',
  'REFUND_FAILED',
  'WEBHOOK_SIGNATURE_INVALID',
  'WEBHOOK_EVENT_STALE',
  'PROVIDER_NOT_CONFIGURED',
  // S17 Finance (REST_API_SPECIFICATION §7.17)
  'SETTLEMENT_NOT_FOUND',
  'SETTLEMENT_STATE_INVALID',
  'DUPLICATE_SETTLEMENT',
  'SETTLEMENT_MINIMUM_NOT_MET',
  'COMMISSION_INVALID',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 422,
  INVALID_SORT: 400,
  AUTH_REQUIRED: 401,
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: 401,
  ACCOUNT_LOCKED: 423,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INSUFFICIENT_STOCK: 409,
  RATE_LIMITED: 429,
  TURNSTILE_FAILED: 422,
  FILE_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  CONFIG_KEY_READONLY: 409,
  API_KEY_INVALID: 401,
  PAYMENT_REQUIRED: 402,
  // S16 Payments
  PAYMENT_FAILED: 422,
  PAYMENT_AMOUNT_MISMATCH: 422,
  INVALID_PAYMENT_SIGNATURE: 422,
  PAYMENT_NOT_CAPTURED: 409,
  PAYMENT_EXPIRED: 410,
  PAYMENT_METHOD_UNAVAILABLE: 422,
  REFUND_EXCEEDS_PAYMENT: 400,
  REFUND_WINDOW_EXPIRED: 400,
  REFUND_REASON_REQUIRED: 422,
  ALREADY_REFUNDED: 409,
  REFUND_FAILED: 500,
  WEBHOOK_SIGNATURE_INVALID: 401,
  WEBHOOK_EVENT_STALE: 401,
  PROVIDER_NOT_CONFIGURED: 503,
  // S17 Finance
  SETTLEMENT_NOT_FOUND: 404,
  SETTLEMENT_STATE_INVALID: 409,
  DUPLICATE_SETTLEMENT: 409,
  SETTLEMENT_MINIMUM_NOT_MET: 422,
  COMMISSION_INVALID: 422,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

// ── Meta ──────────────────────────────────────────────────────────────────────

export interface RequestMeta {
  /** Correlation id — present in every response and every log line. */
  requestId: string;
  /** API version served by this deployment, e.g. "v1". */
  version: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

// ── Envelope ──────────────────────────────────────────────────────────────────

export interface ApiError {
  code: ErrorCode;
  message: string;
  /** Field name for 422 VALIDATION_ERROR (field-level details). */
  field?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  error: null;
  meta: RequestMeta;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  error: ApiError;
  meta: RequestMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type ApiListResponse<T> = ApiSuccessResponse<T[]> & {
  meta: RequestMeta & PaginationMeta;
};

export type ApiCursorListResponse<T> = ApiSuccessResponse<T[]> & {
  meta: RequestMeta & CursorPaginationMeta;
};

// ── List query contracts ──────────────────────────────────────────────────────

export interface OffsetPaginationQuery {
  page?: number;
  limit?: number;
}

export interface CursorPaginationQuery {
  cursor?: string;
  limit?: number;
}

export interface SortQuery {
  sort?: string;
  order?: 'asc' | 'desc';
}
