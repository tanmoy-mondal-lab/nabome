import { getPrisma } from "./prisma";
import type { Env } from "./env";

const VALID_TABLES = new Set([
  "media_assets", "products", "categories", "collections", "brands",
  "coupons", "campaigns", "static_pages", "page_templates", "lookbooks",
  "announcement_bars", "navigation_menus", "footer_sections",
  "homepage_sections", "reviews", "support_tickets",
]);

const ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELD_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function validateTable(table: string): void {
  if (!VALID_TABLES.has(table)) {
    throw new Error(`Invalid table: ${table}`);
  }
}

function validateId(id: string): void {
  if (!ID_REGEX.test(id)) {
    throw new Error(`Invalid id format: ${id}`);
  }
}

function validateField(field: string): void {
  if (!FIELD_REGEX.test(field)) {
    throw new Error(`Invalid field name: ${field}`);
  }
}

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
    validateTable(table);
    validateId(id);
    const deletedAtField = options.deletedAtField || "deletedAt";
    validateField(deletedAtField);
    if (options.deletedByField) validateField(options.deletedByField);

    const prisma = getPrisma(env);

    try {
      const hasDeletedAt = await this.hasColumn(prisma, table, deletedAtField);

      if (!hasDeletedAt) {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "${table}" WHERE id = $1::uuid`,
          id
        );
        return true;
      }

      const setClauses = [`"${deletedAtField}" = NOW()`];
      const params: unknown[] = [id];
      
      if (options.deletedByField && options.userId) {
        validateField(options.deletedByField);
        setClauses.push(`"${options.deletedByField}" = $2::uuid`);
        params.push(options.userId);
      }

      const sql = `UPDATE "${table}" SET ${setClauses.join(", ")} WHERE id = $1::uuid AND "${deletedAtField}" IS NULL`;
      await prisma.$executeRawUnsafe(sql, ...params);
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
    validateTable(table);
    validateId(id);
    const deletedAtField = options.deletedAtField || "deletedAt";
    validateField(deletedAtField);
    const prisma = getPrisma(env);

    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "${table}" SET "${deletedAtField}" = NULL WHERE id = $1::uuid`,
        id
      );
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
    validateTable(table);
    validateId(id);
    const prisma = getPrisma(env);

    try {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "${table}" WHERE id = $1::uuid`,
        id
      );
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
    validateTable(table);
    const deletedAtField = options.deletedAtField || "deletedAt";
    validateField(deletedAtField);
    const prisma = getPrisma(env);

    try {
      const records = await prisma.$queryRawUnsafe(
        `SELECT * FROM "${table}" WHERE "${deletedAtField}" IS NOT NULL ORDER BY "${deletedAtField}" DESC LIMIT 100`
      );
      return records as any[];
    } catch (error) {
      console.error(`Failed to get deleted records from ${table}:`, error);
      return [];
    }
  }

  private async hasColumn(prisma: any, table: string, column: string): Promise<boolean> {
    validateTable(table);
    validateField(column);
    try {
      const result = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2)`,
        table, column
      ) as Array<{ exists: boolean }>;
      return result[0]?.exists ?? false;
    } catch {
      return false;
    }
  }
}

export const softDeleteManager = new SoftDeleteManager();
