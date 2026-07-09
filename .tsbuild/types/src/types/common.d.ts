export interface Pagination {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    timestamp?: string;
}
export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        status: number;
    };
    requestId?: string;
    timestamp?: string;
}
export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: Pagination;
    timestamp?: string;
}
export type SortDirection = "asc" | "desc";
