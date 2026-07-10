export interface SecurityHeaderOptions {
    /** Enable nonce-based CSP (recommended for production) */
    useNonce?: boolean;
    /** Custom CSP directives */
    customCsp?: Record<string, string>;
    /** Cloudinary cloud name for image CDN */
    cloudinaryCloudName?: string;
    /** Enable analytics in CSP */
    allowAnalytics?: boolean;
    /** Environment (development or production) */
    env?: "development" | "production";
}
/**
 * Apply security headers to a response
 */
export declare function setSecurityHeaders(response: Response, options?: SecurityHeaderOptions): Response;
/**
 * Get CSP nonce from response headers (for frontend use)
 */
export declare function getCspNonce(response: Response): string | null;
