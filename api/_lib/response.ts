import { type ApiResponse, type ApiError, ErrorCode } from "./types";

function getTimestamp(): string {
  return new Date().toISOString();
}

export function success<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data, timestamp: getTimestamp() };
  return Response.json(body, { status });
}

export function created<T>(data: T): Response {
  return success(data, 201);
}

export function error(
  code: ErrorCode,
  message: string,
  status = 400,
  details?: unknown,
  requestId?: string
): Response {
  const body: ApiError = {
    success: false,
    error: { code, message, status },
    ...(details ? { details } : {}),
    ...(requestId ? { requestId } : {}),
    timestamp: getTimestamp(),
  };
  return Response.json(body, { status });
}

export function badRequest(message: string, details?: unknown, requestId?: string): Response {
  return error(ErrorCode.VALIDATION_ERROR, message, 400, details, requestId);
}

export function unauthorized(message = "Unauthorized", requestId?: string): Response {
  return error(ErrorCode.UNAUTHORIZED, message, 401, undefined, requestId);
}

export function forbidden(message = "Forbidden", requestId?: string): Response {
  return error(ErrorCode.FORBIDDEN, message, 403, undefined, requestId);
}

export function notFound(message = "Not found", requestId?: string): Response {
  return error(ErrorCode.NOT_FOUND, message, 404, undefined, requestId);
}

export function conflict(message: string, requestId?: string): Response {
  return error(ErrorCode.CONFLICT, message, 409, undefined, requestId);
}

export function serverError(_err?: unknown, requestId?: string): Response {
  // Always return generic error message to avoid exposing internal details
  const message = "Internal server error";
  return error(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, undefined, requestId);
}

export function rateLimitExceeded(message = "Rate limit exceeded", requestId?: string): Response {
  return error(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429, undefined, requestId);
}
