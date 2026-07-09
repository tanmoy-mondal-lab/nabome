interface RequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    params?: Record<string, string | number | undefined>;
    signal?: AbortSignal;
    timeout?: number;
}
declare class ApiError extends Error {
    status: number;
    details?: unknown;
    constructor(message: string, status: number, details?: unknown);
}
export declare const api: {
    get: <T>(endpoint: string, options?: RequestOptions) => Promise<T>;
    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<T>;
    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<T>;
    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<T>;
    delete: <T>(endpoint: string, options?: RequestOptions) => Promise<T>;
};
export { ApiError };
export type { RequestOptions };
