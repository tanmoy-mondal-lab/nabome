/**
 * ID generation utilities
 */

import { randomUUID } from 'crypto';

/**
 * Generate a UUID v4
 * @returns A UUID string
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Generate a short ID (16 characters)
 * @returns A short ID string
 */
export function generateShortId(): string {
  return randomUUID().replace(/-/g, '').substring(0, 16);
}

/**
 * Generate a ULID-like ID (time-ordered)
 * @returns A ULID-like string
 */
export function generateULID(): string {
  const now = Date.now();
  const timeStr = now.toString(36).padStart(10, '0');
  const randomStr = randomUUID().replace(/-/g, '').substring(0, 16);
  return `${timeStr}${randomStr}`.substring(0, 26);
}

/**
 * Generate a numeric ID
 * @param min - Minimum value (default 1)
 * @param max - Maximum value (default 999999)
 * @returns A numeric ID
 */
export function generateNumericId(min: number = 1, max: number = 999999): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a sequential ID based on a counter
 * @param counter - The current counter value
 * @param prefix - Optional prefix
 * @returns A sequential ID string
 */
export function generateSequentialId(counter: number, prefix: string = ''): string {
  const paddedCounter = counter.toString().padStart(6, '0');
  return prefix ? `${prefix}-${paddedCounter}` : paddedCounter;
}

/**
 * Generate a SKU (Stock Keeping Unit)
 * @param prefix - Product prefix
 * @param attributes - Product attributes (size, color, etc.)
 * @returns A SKU string
 */
export function generateSKU(prefix: string, attributes: Record<string, string>): string {
  const attrString = Object.values(attributes)
    .map(attr => attr.substring(0, 3).toUpperCase())
    .join('-');
  return `${prefix}-${attrString}`.toUpperCase();
}
