/**
 * Shared types for seed modules
 */

import type { PrismaClient } from '@prisma/client';

/**
 * Result of a seed operation
 */
export interface SeedResult {
  success: boolean;
  count: number;
  duration: number;
  error?: Error;
}

/**
 * Context passed to seed modules
 */
export interface SeedContext {
  prisma: PrismaClient;
  config: any;
  dependencies: Map<string, any>;
  logger: any;
}

/**
 * Base interface for seed modules
 */
export interface SeedModule {
  /**
   * Module name (must match folder name)
   */
  name: string;

  /**
   * Module dependencies (array of module names)
   */
  dependsOn: string[];

  /**
   * Whether this module is idempotent (can be run multiple times safely)
   */
  idempotent: boolean;

  /**
   * Whether this module should run in a transaction
   */
  transactional: boolean;

  /**
   * Seed function - implements the actual seeding logic
   */
  seed(context: SeedContext): Promise<SeedResult>;

  /**
   * Optional cleanup function - removes data seeded by this module
   */
  cleanup?(context: SeedContext): Promise<void>;

  /**
   * Optional validation function - validates seeded data
   */
  validate?(context: SeedContext): Promise<boolean>;
}

/**
 * Module metadata for dependency resolution
 */
export interface ModuleMetadata {
  name: string;
  dependsOn: string[];
  enabled: boolean;
}
