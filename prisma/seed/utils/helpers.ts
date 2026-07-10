/**
 * Seed Helpers
 * Utility functions for seed operations
 */

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

/**
 * Generate a random UUID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Generate a random phone number
 */
export function generatePhoneNumber(): string {
  return '+91' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

/**
 * Generate a random email
 */
export function generateEmail(name: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanName}@example.com`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Log seed operation
 */
export function logSeed(operation: string, entity: string, status: 'START' | 'SUCCESS' | 'ERROR'): void {
  const timestamp = new Date().toISOString();
  const statusEmoji = status === 'START' ? '🔄' : status === 'SUCCESS' ? '✅' : '❌';
  console.log(`[${timestamp}] ${statusEmoji} ${operation}: ${entity}`);
}

/**
 * Handle seed errors
 */
export function handleSeedError(error: unknown, entity: string): never {
  logSeed('SEED', entity, 'ERROR');
  console.error(error);
  throw error;
}
