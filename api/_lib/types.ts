import type { Env } from "./env";

export interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    status: number;
  };
  details?: unknown;
  requestId?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  timestamp?: string;
}

export interface RequestContext {
  userId?: string;
  userRole?: string;
  env?: Env;
  requestId?: string;
}

export function requireEnv(ctx: RequestContext): Env | never {
  if (!ctx.env) {
    throw new Error("Environment not available");
  }
  return ctx.env;
}

// Standard error codes for consistent error handling
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_JSON = "INVALID_JSON",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  
  // Authentication errors (401)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  
  // Authorization errors (403)
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  
  // Not found errors (404)
  NOT_FOUND = "NOT_FOUND",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  
  // Conflict errors (409)
  CONFLICT = "CONFLICT",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",
  RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}
