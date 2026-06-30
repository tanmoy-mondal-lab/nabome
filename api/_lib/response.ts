import { type ApiResponse, type ApiError } from "./types";

export function success<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data };
  return Response.json(body, { status });
}

export function created<T>(data: T): Response {
  return success(data, 201);
}

export function error(message: string, status = 400, details?: unknown): Response {
  const body: ApiError = {
    success: false,
    error: { message, status },
    ...(details ? { details } : {}),
  };
  return Response.json(body, { status });
}

export function badRequest(message: string, details?: unknown): Response {
  return error(message, 400, details);
}

export function unauthorized(message = "Unauthorized"): Response {
  return error(message, 401);
}

export function forbidden(message = "Forbidden"): Response {
  return error(message, 403);
}

export function notFound(message = "Not found"): Response {
  return error(message, 404);
}

export function conflict(message: string): Response {
  return error(message, 409);
}

export function serverError(_err?: unknown): Response {
  console.error("Internal server error:", _err);
  return error("Internal server error", 500);
}
