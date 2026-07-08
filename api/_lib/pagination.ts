// ─────────────────────────────────────────────────────────────
// API PAGINATION UTILITIES
// ─────────────────────────────────────────────────────────────
// Standardized pagination for list endpoints
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { badRequest } from "./response";
import { ErrorCode } from "./types";
import type { PaginatedResponse } from "./types";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).optional(),
  sortBy: z.string().optional(),
});

export async function parsePaginationParams(
  url: URL,
  requestId?: string
): Promise<{ params: PaginationParams; response?: Response }> {
  try {
    const result = paginationQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    
    if (!result.success) {
      return {
        params: { page: 1, limit: 20, offset: 0 },
        response: badRequest(
          `Invalid pagination parameters: ${result.error.issues.map(i => i.message).join(", ")}`,
          { fields: result.error.issues },
          requestId
        ),
      };
    }

    const { page, limit } = result.data;
    const offset = (page - 1) * limit;

    return {
      params: { page, limit, offset },
    };
  } catch (error) {
    return {
      params: { page: 1, limit: 20, offset: 0 },
      response: badRequest("Invalid pagination parameters", undefined, requestId),
    };
  }
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    pageSize: limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  meta: PaginationMeta
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      total: meta.total,
      page: meta.page,
      pageSize: meta.pageSize,
      totalPages: meta.totalPages,
    },
    timestamp: new Date().toISOString(),
  };
}

export interface SortOptions {
  field: string;
  direction: "asc" | "desc";
}

export function parseSortOptions(
  url: URL,
  allowedFields: string[]
): SortOptions | null {
  const sortBy = url.searchParams.get("sortBy");
  const sort = url.searchParams.get("sort") as "asc" | "desc" | null;

  if (!sortBy || !allowedFields.includes(sortBy)) {
    return null;
  }

  return {
    field: sortBy,
    direction: sort || "asc",
  };
}

export interface FilterOptions {
  [key: string]: string | number | boolean | string[];
}

export function parseFilterOptions(
  url: URL,
  allowedFilters: Record<string, (value: string) => any>
): FilterOptions {
  const filters: FilterOptions = {};
  
  for (const [key, parser] of Object.entries(allowedFilters)) {
    const value = url.searchParams.get(key);
    if (value !== null) {
      filters[key] = parser(value);
    }
  }

  return filters;
}
