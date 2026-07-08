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

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

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

class MigrationRollback {
  private options: RollbackOptions;
  private migrationsDir: string;
  private databaseUrl: string;

  constructor(options: Partial<RollbackOptions> = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      force: options.force || false,
      steps: options.steps || 1,
      toMigration: options.toMigration,
      list: options.list || false,
    };

    this.migrationsDir = './prisma/migrations';
    this.databaseUrl = process.env.DATABASE_URL || '';

    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    if (!existsSync(this.migrationsDir)) {
      throw new Error(`Migrations directory not found: ${this.migrationsDir}`);
    }
  }

  /**
   * List all available migrations
   */
  private listMigrations(): MigrationInfo[] {
    const entries = readdirSync(this.migrationsDir, { withFileTypes: true });
    const migrations: MigrationInfo[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'migration_lock.toml') {
        continue;
      }

      const migrationPath = join(this.migrationsDir, entry.name);
      const migrationSqlPath = join(migrationPath, 'migration.sql');
      const rollbackSqlPath = join(migrationPath, 'rollback.sql');

      const hasRollback = existsSync(rollbackSqlPath);
      const timestamp = entry.name.split('_')[0];

      migrations.push({
        name: entry.name,
        path: migrationPath,
        hasRollback,
        timestamp,
      });
    }

    return migrations.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  /**
   * Display migration list
   */
  private displayMigrations(migrations: MigrationInfo[]): void {
    console.log('\nAvailable Migrations:');
    console.log('─'.repeat(80));
    console.log('Name'.padEnd(50) + 'Timestamp'.padEnd(20) + 'Rollback');
    console.log('─'.repeat(80));

    for (const migration of migrations) {
      const status = migration.hasRollback ? '✓' : '✗';
      console.log(
        migration.name.padEnd(50) +
        migration.timestamp.padEnd(20) +
        status
      );
    }

    console.log('─'.repeat(80));
  }

  /**
   * Get current migration status from database
   */
  private getCurrentMigration(): string | null {
    try {
      const query = "SELECT value FROM _prisma_migrations WHERE key = 'migration_id'";
      const result = execSync(`psql ${this.databaseUrl} -t -c "${query}"`, {
        encoding: 'utf-8',
      }).trim();

      return result || null;
    } catch (error) {
      console.error('Failed to get current migration:', error);
      return null;
    }
  }

  /**
   * Read rollback SQL file
   */
  private readRollbackSql(migrationPath: string): string {
    const rollbackPath = join(migrationPath, 'rollback.sql');
    
    if (!existsSync(rollbackPath)) {
      throw new Error(`Rollback script not found: ${rollbackPath}`);
    }

    return readFileSync(rollbackPath, 'utf-8');
  }

  /**
   * Execute rollback SQL
   */
  private executeRollback(sql: string): void {
    const tempFile = join(this.migrationsDir, 'temp_rollback.sql');
    writeFileSync(tempFile, sql);

    try {
      execSync(`psql ${this.databaseUrl} -f ${tempFile}`, { stdio: 'inherit' });
    } finally {
      // Cleanup temp file
      if (existsSync(tempFile)) {
        execSync(`rm ${tempFile}`);
      }
    }
  }

  /**
   * Update Prisma migration history
   */
  private updateMigrationHistory(migrationName: string, isRollback: boolean): void {
    // This would typically be handled by Prisma's internal migration system
    // For manual rollbacks, we may need to update the _prisma_migrations table
    console.log(`Note: Migration history update for ${migrationName} may be required`);
  }

  /**
   * Prompt user for confirmation
   */
  private async confirmRollback(migrations: MigrationInfo[]): Promise<boolean> {
    if (this.options.force) return true;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n⚠️  WARNING: You are about to rollback the following migrations:');
    for (const migration of migrations) {
      console.log(`  - ${migration.name}`);
    }

    const answer = await new Promise<string>((resolve) => {
      rl.question('\nAre you sure you want to proceed? (yes/no): ', resolve);
    });

    rl.close();
    return answer.toLowerCase() === 'yes';
  }

  /**
   * Perform rollback
   */
  async performRollback(): Promise<void> {
    const migrations = this.listMigrations();

    // List mode
    if (this.options.list) {
      this.displayMigrations(migrations);
      return;
    }

    // Get current migration
    const currentMigration = this.getCurrentMigration();
    console.log(`Current migration: ${currentMigration || 'None'}`);

    // Determine migrations to rollback
    let migrationsToRollback: MigrationInfo[] = [];

    if (this.options.toMigration) {
      // Rollback to specific migration
      const targetIndex = migrations.findIndex(m => m.name === this.options.toMigration);
      if (targetIndex === -1) {
        throw new Error(`Migration not found: ${this.options.toMigration}`);
      }
      migrationsToRollback = migrations.slice(targetIndex + 1).reverse();
    } else {
      // Rollback N steps
      const startIndex = migrations.length - this.options.steps;
      if (startIndex < 0) {
        throw new Error(`Cannot rollback ${this.options.steps} migrations. Only ${migrations.length} available.`);
      }
      migrationsToRollback = migrations.slice(startIndex).reverse();
    }

    if (migrationsToRollback.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    // Check if all migrations have rollback scripts
    const missingRollback = migrationsToRollback.filter(m => !m.hasRollback);
    if (missingRollback.length > 0) {
      console.error('Error: The following migrations do not have rollback scripts:');
      for (const migration of missingRollback) {
        console.error(`  - ${migration.name}`);
      }
      throw new Error('Cannot rollback without rollback scripts');
    }

    // Dry run mode
    if (this.options.dryRun) {
      console.log('\nDry run mode - would rollback the following migrations:');
      for (const migration of migrationsToRollback) {
        console.log(`  - ${migration.name}`);
      }
      return;
    }

    // Confirm rollback
    const confirmed = await this.confirmRollback(migrationsToRollback);
    if (!confirmed) {
      console.log('Rollback cancelled by user');
      return;
    }

    // Execute rollbacks in reverse order
    console.log('\nExecuting rollbacks...');
    for (const migration of migrationsToRollback) {
      console.log(`Rolling back: ${migration.name}`);

      try {
        const rollbackSql = this.readRollbackSql(migration.path);
        this.executeRollback(rollbackSql);
        this.updateMigrationHistory(migration.name, true);
        console.log(`✓ Rolled back: ${migration.name}`);
      } catch (error) {
        console.error(`✗ Failed to rollback ${migration.name}:`, error);
        throw error;
      }
    }

    console.log('\nRollback completed successfully');
  }

  /**
   * Generate rollback script for a migration
   */
  static generateRollback(migrationName: string): void {
    const migrationsDir = './prisma/migrations';
    const migrationPath = join(migrationsDir, migrationName);
    const migrationSqlPath = join(migrationPath, 'migration.sql');
    const rollbackSqlPath = join(migrationPath, 'rollback.sql');

    if (!existsSync(migrationSqlPath)) {
      throw new Error(`Migration SQL not found: ${migrationSqlPath}`);
    }

    const migrationSql = readFileSync(migrationSqlPath, 'utf-8');
    const rollbackSql = MigrationRollback.generateRollbackFromMigration(migrationSql);

    writeFileSync(rollbackSqlPath, rollbackSql);
    console.log(`Generated rollback script: ${rollbackSqlPath}`);
  }

  /**
   * Generate rollback SQL from migration SQL
   */
  private static generateRollbackFromMigration(migrationSql: string): string {
    const lines = migrationSql.split('\n');
    const rollbackStatements: string[] = [];

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();

      // Skip comments and empty lines
      if (line.startsWith('--') || line === '') continue;

      // Handle CREATE TABLE -> DROP TABLE
      if (line.toUpperCase().startsWith('CREATE TABLE')) {
        const tableName = line.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?["']?(\w+)/i)?.[1];
        if (tableName) {
          rollbackStatements.push(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        }
      }

      // Handle ALTER TABLE ADD COLUMN -> ALTER TABLE DROP COLUMN
      if (line.toUpperCase().includes('ALTER TABLE') && line.toUpperCase().includes('ADD COLUMN')) {
        const match = line.match(/ALTER TABLE\s+["']?(\w+)["']?\s+ADD COLUMN\s+(?:IF NOT EXISTS\s+)?["']?(\w+)/i);
        if (match) {
          const [, tableName, columnName] = match;
          rollbackStatements.push(`ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}";`);
        }
      }

      // Handle CREATE INDEX -> DROP INDEX
      if (line.toUpperCase().startsWith('CREATE INDEX')) {
        const indexName = line.match(/CREATE (?:UNIQUE )?INDEX\s+(?:IF NOT EXISTS\s+)?["']?(\w+)/i)?.[1];
        if (indexName) {
          rollbackStatements.push(`DROP INDEX IF EXISTS "${indexName}";`);
        }
      }

      // Handle ALTER TABLE ADD CONSTRAINT -> ALTER TABLE DROP CONSTRAINT
      if (line.toUpperCase().includes('ADD CONSTRAINT')) {
        const match = line.match(/ALTER TABLE\s+["']?(\w+)["']?\s+ADD CONSTRAINT\s+["']?(\w+)/i);
        if (match) {
          const [, tableName, constraintName] = match;
          rollbackStatements.push(`ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}";`);
        }
      }
    }

    if (rollbackStatements.length === 0) {
      return '-- This migration does not have an automatic rollback\n-- Please write the rollback SQL manually\n';
    }

    return `-- Auto-generated rollback for migration\n-- Please review and modify as needed\n\n${rollbackStatements.join('\n')}\n`;
  }
}

// Parse command line arguments
function parseArgs(): { migrationName?: string; options: Partial<RollbackOptions> } {
  const args = process.argv.slice(2);
  const options: Partial<RollbackOptions> = {};
  let migrationName = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--steps':
        options.steps = parseInt(args[++i]);
        break;
      case '--to':
        options.toMigration = args[++i];
        break;
      case '--list':
        options.list = true;
        break;
      case '--generate':
        // Special case for generating rollback scripts
        migrationName = args[++i];
        MigrationRollback.generateRollback(migrationName);
        process.exit(0);
        break;
      default:
        if (!arg.startsWith('--')) {
          migrationName = arg;
        }
    }
  }

  return { migrationName, options };
}

// Main execution
async function main() {
  try {
    const { migrationName, options } = parseArgs();
    const rollback = new MigrationRollback(options);
    await rollback.performRollback();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { MigrationRollback, RollbackOptions, MigrationInfo };
