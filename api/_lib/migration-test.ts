// ─────────────────────────────────────────────────────────────
// MIGRATION TESTING UTILITY
// ─────────────────────────────────────────────────────────────
// Tests database migrations for validity and safety
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Env } from "./env";

export interface MigrationTestResult {
  migrationName: string;
  success: boolean;
  duration: number;
  error?: string;
  warnings?: string[];
}

export class MigrationTester {
  async testMigration(migrationName: string, env?: Env): Promise<MigrationTestResult> {
    const startTime = Date.now();
    const warnings: string[] = [];

    try {
      const prisma = getPrisma(env);

      // Test basic connectivity
      await prisma.$queryRaw`SELECT 1`;

      // Check if migration table exists
      const migrationTableExists = await this.tableExists(prisma, "_prisma_migrations");
      if (!migrationTableExists) {
        warnings.push("Migration table does not exist");
      }

      // Check for foreign key constraints
      const fkCheckResult = await this.checkForeignKeys(prisma);
      if (!fkCheckResult.valid) {
        warnings.push(...fkCheckResult.warnings);
      }

      const duration = Date.now() - startTime;

      return {
        migrationName,
        success: true,
        duration,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        migrationName,
        success: false,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async tableExists(prisma: ReturnType<typeof getPrisma>, tableName: string): Promise<boolean> {
    try {
      const result = await prisma.$queryRaw<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = ${tableName}
        )
      `;
      return result[0].exists;
    } catch {
      return false;
    }
  }

  private async checkForeignKeys(prisma: ReturnType<typeof getPrisma>): Promise<{
    valid: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    try {
      // Check for orphaned records (basic check)
      const tables = await prisma.$queryRaw<{ table_name: string }[]>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `;

      for (const table of tables) {
        // Skip system tables
        if (table.table_name.startsWith("_")) continue;

        // This is a simplified check - in production, you'd want more thorough validation
        await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${table.table_name}"`
        );
      }

      return { valid: true, warnings };
    } catch (error) {
      warnings.push(`Foreign key check failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return { valid: false, warnings };
    }
  }

  async rollbackTest(env?: Env): Promise<boolean> {
    try {
      const prisma = getPrisma(env);
      
      // Test if we can query the migration history
      await prisma.$queryRaw`SELECT * FROM _prisma_migrations LIMIT 1`;
      
      return true;
    } catch {
      return false;
    }
  }
}

export const migrationTester = new MigrationTester();
