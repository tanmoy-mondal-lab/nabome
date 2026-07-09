/**
 * Seed configuration types
 */

export type SeedPreset = 'development' | 'small' | 'large' | 'performance' | 'stress';

export interface SeedConfig {
  preset: SeedPreset;
  counts: Record<string, number>;
  limits: Record<string, number>;
  defaults: Record<string, any>;
  options: SeedOptions;
}

export interface SeedOptions {
  // Execution options
  clearBeforeSeed: boolean;
  useTransactions: boolean;
  stopOnError: boolean;
  
  // Media options
  uploadMedia: boolean;
  useLocalMedia: boolean;
  
  // Logging options
  verbose: boolean;
  logSql: boolean;
  
  // Performance options
  batchSize: number;
  concurrency: number;
  
  // Validation options
  validateData: boolean;
  skipValidation: boolean;
}

export interface SeedModuleConfig {
  name: string;
  enabled: boolean;
  dependsOn: string[];
  idempotent: boolean;
  transactional: boolean;
}
