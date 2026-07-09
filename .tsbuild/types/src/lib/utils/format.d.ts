/**
 * Formats a numeric amount as Indian Rupee (INR) currency string.
 * @param amount - Numeric value, string number, or object with toString()
 * @returns Formatted currency string (e.g., "₹1,234")
 */
export declare function formatPrice(amount: number | string | {
    toString(): string;
}): string;
/**
 * Formats a numeric amount as compact Indian Rupee (INR) string.
 * @param amount - Numeric value or string number
 * @returns Compact currency string (e.g., "₹1.2K")
 */
export declare function formatCompactPrice(amount: number | string): string;
/**
 * Formats a date as a readable Indian locale date string.
 * @param date - Date object, ISO string, or null
 * @returns Formatted date string (e.g., "Jul 15, 2026") or "—" for null
 */
export declare function formatDate(date: Date | string | null): string;
/**
 * Formats a date as a readable Indian locale date-time string.
 * @param date - Date object, ISO string, or null
 * @returns Formatted date-time string (e.g., "Jul 15, 2026, 02:30 PM") or "—" for null
 */
export declare function formatDateTime(date: Date | string | null): string;
export declare function slugify(text: string): string;
export declare function generateOrderNumber(): string;
export declare function truncate(text: string, length: number): string;
