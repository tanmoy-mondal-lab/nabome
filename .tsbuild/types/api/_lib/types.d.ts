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
export declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INVALID_JSON = "INVALID_JSON",
    INVALID_INPUT = "INVALID_INPUT",
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    UNAUTHORIZED = "UNAUTHORIZED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_INVALID = "TOKEN_INVALID",
    FORBIDDEN = "FORBIDDEN",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    NOT_FOUND = "NOT_FOUND",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    CONFLICT = "CONFLICT",
    DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",
    RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
}
