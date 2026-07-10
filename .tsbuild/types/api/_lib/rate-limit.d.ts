export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message?: string;
}
declare const DEFAULTS: {
    auth: {
        windowMs: number;
        maxRequests: number;
        message: string;
    };
    standard: {
        windowMs: number;
        maxRequests: number;
        message: string;
    };
    admin: {
        windowMs: number;
        maxRequests: number;
        message: string;
    };
    contact: {
        windowMs: number;
        maxRequests: number;
        message: string;
    };
    resendVerification: {
        windowMs: number;
        maxRequests: number;
        message: string;
    };
};
export declare function checkRateLimit(key: string, config?: RateLimitConfig, env?: any): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
}>;
export declare function rateLimitResponse(message: string, resetAt: number): Response;
export declare function withRateLimit(key: string, config?: RateLimitConfig, env?: any): Promise<Response | null>;
export declare function getRateLimitKey(ip: string, endpoint: string, userId?: string): string;
export { DEFAULTS as RATE_LIMIT_CONFIG };
