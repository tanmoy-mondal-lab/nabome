import { z } from "zod";
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
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    sortBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sort?: "desc" | "asc" | undefined;
    sortBy?: string | undefined;
}, {
    sort?: "desc" | "asc" | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: string | undefined;
}>;
export declare function parsePaginationParams(url: URL, requestId?: string): Promise<{
    params: PaginationParams;
    response?: Response;
}>;
export declare function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta;
export declare function createPaginatedResponse<T>(data: T[], meta: PaginationMeta): PaginatedResponse<T>;
export interface SortOptions {
    field: string;
    direction: "asc" | "desc";
}
export declare function parseSortOptions(url: URL, allowedFields: string[]): SortOptions | null;
export interface FilterOptions {
    [key: string]: string | number | boolean | string[];
}
export declare function parseFilterOptions(url: URL, allowedFilters: Record<string, (value: string) => any>): FilterOptions;
