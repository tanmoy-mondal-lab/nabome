/**
 * Security Validation Utilities
 * Provides validation and sanitization for user inputs to prevent XSS, injection attacks, and other security vulnerabilities.
 */
/**
 * Validates file upload for security
 */
export declare function validateFileUpload(file: File): {
    valid: boolean;
    error?: string;
};
/**
 * Validates image dimensions
 */
export declare function validateImageDimensions(width: number, height: number): {
    valid: boolean;
    error?: string;
};
/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export declare function sanitizeHtml(html: string): string;
/**
 * Sanitizes Markdown content
 * Removes potentially dangerous content while preserving Markdown formatting
 */
export declare function sanitizeMarkdown(markdown: string): string;
/**
 * Validates and sanitizes user input to prevent XSS
 */
export declare function sanitizeUserInput(input: string): string;
/**
 * Validates URL to prevent malicious redirects
 */
export declare function validateUrl(url: string): {
    valid: boolean;
    error?: string;
};
/**
 * Validates email address format
 */
export declare function validateEmail(email: string): {
    valid: boolean;
    error?: string;
};
/**
 * Validates phone number format
 */
export declare function validatePhone(phone: string): {
    valid: boolean;
    error?: string;
};
/**
 * Validates slug format for URLs
 */
export declare function validateSlug(slug: string): {
    valid: boolean;
    error?: string;
};
/**
 * Checks for SQL injection patterns
 */
export declare function detectSqlInjection(input: string): boolean;
/**
 * Validates permission for admin actions
 */
export declare function validateAdminPermission(userRole: string, requiredRole: string): boolean;
/**
 * Validates that a user can perform an action on a specific entity
 */
export declare function validateEntityPermission(userId: string, entityOwnerId: string | null | undefined, userRole: string): boolean;
/**
 * Rate limit check helper
 */
export declare class RateLimiter {
    private attempts;
    private maxAttempts;
    private windowMs;
    constructor(maxAttempts?: number, windowMs?: number);
    check(identifier: string): {
        allowed: boolean;
        remainingAttempts: number;
    };
    reset(identifier: string): void;
}
