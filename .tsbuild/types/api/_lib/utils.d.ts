/**
 * Generate a URL-safe slug from text.
 * Supports Latin + Devanagari (Bengali) characters.
 */
export declare function slugify(text: string): string;
/**
 * Generate a unique slug by appending a short random suffix.
 */
export declare function uniqueSlug(text: string): string;
export declare const ORDER_STATUS_FLOW: Record<string, string[]>;
/**
 * Parse request body safely, returning null on failure.
 */
export declare function parseBody(req: Request): Promise<Record<string, unknown> | null>;
