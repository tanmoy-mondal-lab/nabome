/**
 * Seed configuration presets
 * Different dataset sizes for different use cases
 */

import type { SeedConfig } from './types';
import { SEED_COUNTS, SEED_LIMITS, SEED_DEFAULTS } from '../constants';

/**
 * Development preset - Balanced dataset for local development
 */
export const DEVELOPMENT_PRESET: Partial<SeedConfig> = {
  preset: 'development',
  counts: {
    ...SEED_COUNTS,
    ADMINS: 2,
    SELLERS: 5,
    CUSTOMERS: 20,
    BRANDS: 8,
    CATEGORIES: 6,
    COLLECTIONS: 4,
    PRODUCTS: 30,
    ORDERS: 20,
    REVIEWS: 30,
  },
  options: {
    clearBeforeSeed: true,
    useTransactions: true,
    stopOnError: true,
    uploadMedia: false,
    useLocalMedia: false,
    verbose: true,
    logSql: false,
    batchSize: 50,
    concurrency: 5,
    validateData: true,
    skipValidation: false,
  },
};

/**
 * Small preset - Minimal dataset for quick testing
 */
export const SMALL_PRESET: Partial<SeedConfig> = {
  preset: 'small',
  counts: {
    ...SEED_COUNTS,
    ADMINS: 1,
    SELLERS: 2,
    CUSTOMERS: 5,
    BRANDS: 3,
    CATEGORIES: 3,
    COLLECTIONS: 2,
    PRODUCTS: 10,
    ORDERS: 5,
    REVIEWS: 10,
  },
  options: {
    clearBeforeSeed: true,
    useTransactions: true,
    stopOnError: true,
    uploadMedia: false,
    useLocalMedia: false,
    verbose: true,
    logSql: false,
    batchSize: 25,
    concurrency: 3,
    validateData: true,
    skipValidation: false,
  },
};

/**
 * Large preset - Comprehensive dataset for realistic testing
 */
export const LARGE_PRESET: Partial<SeedConfig> = {
  preset: 'large',
  counts: {
    ...SEED_COUNTS,
    ADMINS: 3,
    SELLERS: 20,
    CUSTOMERS: 100,
    BRANDS: 25,
    CATEGORIES: 15,
    COLLECTIONS: 12,
    PRODUCTS: 250,
    ORDERS: 300,
    REVIEWS: 500,
  },
  options: {
    clearBeforeSeed: true,
    useTransactions: true,
    stopOnError: true,
    uploadMedia: false,
    useLocalMedia: false,
    verbose: false,
    logSql: false,
    batchSize: 100,
    concurrency: 10,
    validateData: true,
    skipValidation: false,
  },
};

/**
 * Performance preset - Large dataset for performance testing
 */
export const PERFORMANCE_PRESET: Partial<SeedConfig> = {
  preset: 'performance',
  counts: {
    ...SEED_COUNTS,
    ADMINS: 2,
    SELLERS: 50,
    CUSTOMERS: 500,
    BRANDS: 50,
    CATEGORIES: 30,
    COLLECTIONS: 20,
    PRODUCTS: 1000,
    ORDERS: 2000,
    REVIEWS: 3000,
  },
  options: {
    clearBeforeSeed: true,
    useTransactions: false,
    stopOnError: false,
    uploadMedia: false,
    useLocalMedia: false,
    verbose: false,
    logSql: false,
    batchSize: 500,
    concurrency: 20,
    validateData: false,
    skipValidation: true,
  },
};

/**
 * Stress preset - Maximum dataset for stress testing
 */
export const STRESS_PRESET: Partial<SeedConfig> = {
  preset: 'stress',
  counts: {
    ...SEED_COUNTS,
    ADMINS: 2,
    SELLERS: 100,
    CUSTOMERS: 1000,
    BRANDS: 100,
    CATEGORIES: 50,
    COLLECTIONS: 40,
    PRODUCTS: 5000,
    ORDERS: 10000,
    REVIEWS: 15000,
  },
  options: {
    clearBeforeSeed: true,
    useTransactions: false,
    stopOnError: false,
    uploadMedia: false,
    useLocalMedia: false,
    verbose: false,
    logSql: false,
    batchSize: 1000,
    concurrency: 50,
    validateData: false,
    skipValidation: true,
  },
};

/**
 * Get preset configuration by name
 */
export function getPreset(preset: string): Partial<SeedConfig> {
  switch (preset) {
    case 'development':
      return DEVELOPMENT_PRESET;
    case 'small':
      return SMALL_PRESET;
    case 'large':
      return LARGE_PRESET;
    case 'performance':
      return PERFORMANCE_PRESET;
    case 'stress':
      return STRESS_PRESET;
    default:
      return DEVELOPMENT_PRESET;
  }
}

/**
 * All available presets
 */
export const AVAILABLE_PRESETS = [
  'development',
  'small',
  'large',
  'performance',
  'stress',
] as const;
