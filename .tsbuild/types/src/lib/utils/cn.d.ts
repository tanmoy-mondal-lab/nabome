import { type ClassValue } from "clsx";
/**
 * Merges Tailwind CSS class names with conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 * @param inputs - Class values (strings, objects, arrays) to merge
 * @returns Merged and deduplicated class string
 */
export declare function cn(...inputs: ClassValue[]): string;
