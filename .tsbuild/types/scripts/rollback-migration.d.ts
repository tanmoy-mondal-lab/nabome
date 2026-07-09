#!/usr/bin/env tsx
/**
 * Migration Rollback Script for NABOME
 *
 * This script manages database migration rollbacks with the following features:
 * - Automatic rollback script generation
 * - Safe rollback execution with pre-checks
 * - Rollback verification
 * - Multi-step rollback support
 * - Dry-run mode
 *
 * Usage:
 *   npx tsx scripts/rollback-migration.ts <migration-name> [options]
 *
 * Options:
 *   --dry-run           Verify rollback without executing
 *   --force             Force rollback without confirmation
 *   --steps             Number of migrations to rollback (default: 1)
 *   --to                Rollback to specific migration
 *   --list              List available migrations
 */
interface RollbackOptions {
    dryRun: boolean;
    force: boolean;
    steps: number;
    toMigration?: string;
    list: boolean;
}
interface MigrationInfo {
    name: string;
    path: string;
    hasRollback: boolean;
    timestamp: string;
}
declare class MigrationRollback {
    private options;
    private migrationsDir;
    private databaseUrl;
    constructor(options?: Partial<RollbackOptions>);
    /**
     * List all available migrations
     */
    private listMigrations;
    /**
     * Display migration list
     */
    private displayMigrations;
    /**
     * Get current migration status from database
     */
    private getCurrentMigration;
    /**
     * Read rollback SQL file
     */
    private readRollbackSql;
    /**
     * Execute rollback SQL
     */
    private executeRollback;
    /**
     * Update Prisma migration history
     */
    private updateMigrationHistory;
    /**
     * Prompt user for confirmation
     */
    private confirmRollback;
    /**
     * Perform rollback
     */
    performRollback(): Promise<void>;
    /**
     * Generate rollback script for a migration
     */
    static generateRollback(migrationName: string): void;
    /**
     * Generate rollback SQL from migration SQL
     */
    private static generateRollbackFromMigration;
}
export { MigrationRollback, RollbackOptions, MigrationInfo };
