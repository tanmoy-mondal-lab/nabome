import type { Env } from "./env";

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    status: number;
  };
  details?: unknown;
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
}

export interface RequestContext {
  userId?: string;
  userRole?: string;
  env?: Env;
}
