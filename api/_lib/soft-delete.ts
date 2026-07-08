// ─────────────────────────────────────────────────────────────
// SOFT DELETE UTILITY
// ─────────────────────────────────────────────────────────────
// Provides soft delete functionality for records
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Env } from "./env";

export interface SoftDeleteOptions {
  deletedAtField?: string;
  deletedByField?: string;
  userId?: string;
}

export class SoftDeleteManager {
  async softDelete(
    table: string,
    id: string,
    options: SoftDeleteOptions = {},
    env?: Env
  ): Promise<boolean> {
    const prisma = getPrisma(env);
    const deletedAtField = options.deletedAtField || "deletedAt";
    const deletedByField = options.deletedByField || "deletedBy";

    try {
      // Check if table has soft delete fields
      const hasDeletedAt = await this.hasColumn(prisma, table, deletedAtField);
      
      if (!hasDeletedAt) {
        // Fall back to hard delete
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE id = '${id}'`);
        return true;
      }

      // Perform soft delete
      const updateFields = [`"${deletedAtField}" = NOW()`];
      
      if (options.deletedByField && options.userId) {
        updateFields.push(`"${deletedByField}" = '${options.userId}'`);
      }

      await prisma.$executeRawUnsafe(`
        UPDATE "${table}" 
        SET ${updateFields.join(", ")} 
        WHERE id = '${id}' AND "${deletedAtField}" IS NULL
      `);

      return true;
    } catch (error) {
      console.error(`Failed to soft delete ${table} with id ${id}:`, error);
      return false;
    }
  }

  async restore(
    table: string,
    id: string,
    options: SoftDeleteOptions = {},
    env?: Env
  ): Promise<boolean> {
    const prisma = getPrisma(env);
    const deletedAtField = options.deletedAtField || "deletedAt";

    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "${table}" 
        SET "${deletedAtField}" = NULL 
        WHERE id = '${id}'
      `);

      return true;
    } catch (error) {
      console.error(`Failed to restore ${table} with id ${id}:`, error);
      return false;
    }
  }

  async permanentDelete(
    table: string,
    id: string,
    env?: Env
  ): Promise<boolean> {
    const prisma = getPrisma(env);

    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE id = '${id}'`);
      return true;
    } catch (error) {
      console.error(`Failed to permanently delete ${table} with id ${id}:`, error);
      return false;
    }
  }

  async getDeletedRecords(
    table: string,
    options: SoftDeleteOptions = {},
    env?: Env
  ): Promise<any[]> {
    const prisma = getPrisma(env);
    const deletedAtField = options.deletedAtField || "deletedAt";

    try {
      const records = await prisma.$queryRawUnsafe(`
        SELECT * FROM "${table}" 
        WHERE "${deletedAtField}" IS NOT NULL 
        ORDER BY "${deletedAtField}" DESC 
        LIMIT 100
      `);

      return records as any[];
    } catch (error) {
      console.error(`Failed to get deleted records from ${table}:`, error);
      return [];
    }
  }

  private async hasColumn(prisma: any, table: string, column: string): Promise<boolean> {
    try {
      const result = await prisma.$queryRawUnsafe(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = '${table}' 
          AND column_name = '${column}'
        )
      `) as Array<{ exists: boolean }>;

      return result[0].exists;
    } catch {
      return false;
    }
  }
}

export const softDeleteManager = new SoftDeleteManager();
