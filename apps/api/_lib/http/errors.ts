/**
 * ApiError — thrown by handlers; rendered by the catch-all into the canonical
 * envelope (REST_API_SPECIFICATION §5.1/§6.7). Framework-agnostic.
 */
import { ERROR_HTTP_STATUS } from '@nabome/api-contracts';
import type { ErrorCode } from '@nabome/api-contracts';

export interface ApiErrorOptions {
  code: ErrorCode;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
  /** HTTP status override (defaults to ERROR_HTTP_STATUS[code]). */
  status?: number;
}

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly field?: string;
  readonly details?: Record<string, unknown>;
  readonly status: number;

  constructor({ code, message, field, details, status }: ApiErrorOptions) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.field = field;
    this.details = details;
    this.status = status ?? ERROR_HTTP_STATUS[code];
  }

  static validation(
    message: string,
    field?: string,
    details?: Record<string, unknown>,
  ) {
    return new ApiError({ code: 'VALIDATION_ERROR', message, field, details });
  }

  static notFound(message = 'Resource not found') {
    return new ApiError({ code: 'NOT_FOUND', message });
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError({ code: 'AUTH_REQUIRED', message });
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError({ code: 'FORBIDDEN', message });
  }

  static conflict(message: string, details?: Record<string, unknown>) {
    return new ApiError({ code: 'CONFLICT', message, details });
  }

  static rateLimited(message = 'Rate limit exceeded') {
    return new ApiError({ code: 'RATE_LIMITED', message });
  }

  static internal(message = 'Internal server error') {
    return new ApiError({ code: 'INTERNAL_ERROR', message });
  }

  static badRequest(
    message: string,
    field?: string,
    details?: Record<string, unknown>,
  ) {
    return new ApiError({ code: 'VALIDATION_ERROR', message, field, details });
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
