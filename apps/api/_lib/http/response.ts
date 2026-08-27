/**
 * Envelope rendering — every response carries { success, data, error, meta }
 * (REST_API_SPECIFICATION §5.1). Request ID is injected by the middleware and
 * echoed back in every response for correlation.
 */
import type {
  ApiErrorResponse,
  ApiListResponse,
  ApiSuccessResponse,
  PaginationMeta,
} from '@nabome/api-contracts';
import { API_VERSION } from '@nabome/constants';

import type { ApiError } from './errors.ts';

export const JSON_HEADERS: Record<string, string> = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export function success<T>(data: T, requestId: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    error: null,
    meta: { requestId, version: API_VERSION },
  };
}

export function list<T>(
  data: T[],
  requestId: string,
  pagination: PaginationMeta,
): ApiListResponse<T> {
  return {
    success: true,
    data,
    error: null,
    meta: { requestId, version: API_VERSION, ...pagination },
  };
}

export function failure(error: ApiError, requestId: string): ApiErrorResponse {
  return {
    success: false,
    data: null,
    error: {
      code: error.code,
      message: error.message,
      ...(error.field ? { field: error.field } : {}),
      ...(error.details ? { details: error.details } : {}),
    },
    meta: { requestId, version: API_VERSION },
  };
}

export function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

export function okJson(data: unknown, requestId: string): Response {
  return json(success(data, requestId), 200);
}

export function createdJson(data: unknown, requestId: string): Response {
  return json(success(data, requestId), 201);
}

export function errorJson(error: ApiError, requestId: string): Response {
  return json(failure(error, requestId), error.status);
}
