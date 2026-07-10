/**
 * Generate a cryptographically secure nonce for CSP
 */
export declare function generateNonce(): string;
/**
 * Replace {nonce} placeholder in CSP header with actual nonce
 */
export declare function injectNonce(csp: string, nonce: string): string;
