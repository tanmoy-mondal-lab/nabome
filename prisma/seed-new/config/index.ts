/**
 * Seed configuration system
 * Manages seed configuration for different environments and use cases
 */

import type { SeedConfig, SeedOptions } from './types';
import { getPreset } from './presets';
import { SEED_LIMITS, SEED_DEFAULTS } from '../constants';

/**
 * Get seed configuration from environment or default
 */
export function getSeedConfig(): SeedConfig {
  const preset = (process.env.SEED_PRESET || 'development') as any;
  const presetConfig = getPreset(preset);

  return {
    preset: presetConfig.preset || 'development',
    counts: presetConfig.counts || {},
    limits: { ...SEED_LIMITS },
    defaults: { ...SEED_DEFAULTS },
    options: {
      clearBeforeSeed: process.env.SEED_CLEAR_BEFORE_SEED !== 'false',
      useTransactions: process.env.SEED_USE_TRANSACTIONS !== 'false',
      stopOnError: process.env.SEED_STOP_ON_ERROR !== 'false',
      uploadMedia: process.env.SEED_UPLOAD_MEDIA === 'true',
      useLocalMedia: process.env.SEED_USE_LOCAL_MEDIA === 'true',
      verbose: process.env.SEED_VERBOSE === 'true',
      logSql: process.env.SEED_LOG_SQL === 'true',
      batchSize: parseInt(process.env.SEED_BATCH_SIZE || '100'),
      concurrency: parseInt(process.env.SEED_CONCURRENCY || '10'),
      validateData: process.env.SEED_VALIDATE_DATA !== 'false',
      skipValidation: process.env.SEED_SKIP_VALIDATION === 'true',
      ...presetConfig.options,
    },
  };
}

/**
 * Validate seed configuration
 */
export function validateSeedConfig(config: SeedConfig): boolean {
  if (!config.preset) {
    throw new Error('Seed config must have a preset');
  }

  if (config.options.batchSize < 1) {
    throw new Error('Batch size must be at least 1');
  }

  if (config.options.concurrency < 1) {
    throw new Error('Concurrency must be at least 1');
  }

  return true;
}

/**
 * Get count for a specific entity
 */
export function getCount(config: SeedConfig, entity: string): number {
  return config.counts[entity] || 0;
}

/**
 * Get limit for a specific constraint
 */
export function getLimit(config: SeedConfig, limit: string): number {
  return config.limits[limit] || 0;
}

/**
 * Get default value for a specific setting
 */
export function getDefault(config: SeedConfig, setting: string): any {
  return config.defaults[setting];
}
