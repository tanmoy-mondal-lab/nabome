// ─────────────────────────────────────────────────────────────
// INDEX STRATEGY UTILITY
// ─────────────────────────────────────────────────────────────
// Manages database index creation and optimization
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Env } from "./env";

export interface IndexRecommendation {
  table: string;
  column: string;
  type: "btree" | "hash" | "gin" | "gist";
  reason: string;
  priority: "high" | "medium" | "low";
}

export class IndexStrategyManager {
  async analyzeIndexUsage(env?: Env): Promise<{
    unusedIndexes: Array<{ table: string; index: string }>;
    missingIndexes: IndexRecommendation[];
  }> {
    const prisma = getPrisma(env);
    const unusedIndexes: Array<{ table: string; index: string }> = [];
    const missingIndexes: IndexRecommendation[] = [];

    try {
      // Find unused indexes (simplified - in production, use pg_stat_user_indexes)
      const indexes = await prisma.$queryRaw`
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public'
      ` as Array<{ indexname: string; tablename: string }>;

      // Analyze for missing indexes
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ` as Array<{ table_name: string }>;

      for (const table of tables) {
        // Suggest indexes for frequently queried columns
        const columns = await prisma.$queryRawUnsafe(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${table.table_name}' 
          AND (column_name LIKE '%Id' OR column_name LIKE '%_id')
        `) as Array<{ column_name: string }>;

        for (const col of columns) {
          missingIndexes.push({
            table: table.table_name,
            column: col.column_name,
            type: "btree",
            reason: "Foreign key column - improves join performance",
            priority: "high",
          });
        }
      }

      return { unusedIndexes, missingIndexes };
    } catch (error) {
      console.error("Failed to analyze index usage:", error);
      return { unusedIndexes, missingIndexes };
    }
  }

  async createIndex(
    table: string,
    column: string,
    type: "btree" | "hash" | "gin" | "gist" = "btree",
    unique = false,
    env?: Env
  ): Promise<boolean> {
    const prisma = getPrisma(env);
    const indexName = `idx_${table}_${column}`;
    
    try {
      await prisma.$executeRawUnsafe(`
        CREATE ${unique ? "UNIQUE " : ""}INDEX CONCURRENTLY IF NOT EXISTS "${indexName}" 
        ON "${table}" USING ${type} ("${column}")
      `);
      return true;
    } catch (error) {
      console.error(`Failed to create index ${indexName}:`, error);
      return false;
    }
  }

  async dropIndex(table: string, index: string, env?: Env): Promise<boolean> {
    const prisma = getPrisma(env);
    
    try {
      await prisma.$executeRawUnsafe(`DROP INDEX CONCURRENTLY IF EXISTS "${index}"`);
      return true;
    } catch (error) {
      console.error(`Failed to drop index ${index}:`, error);
      return false;
    }
  }

  async rebuildIndex(index: string, env?: Env): Promise<boolean> {
    const prisma = getPrisma(env);
    
    try {
      await prisma.$executeRawUnsafe(`REINDEX INDEX CONCURRENTLY "${index}"`);
      return true;
    } catch (error) {
      console.error(`Failed to rebuild index ${index}:`, error);
      return false;
    }
  }

  async getIndexStats(env?: Env): Promise<Array<{
    table: string;
    index: string;
    size: number;
    scans: number;
    tuplesRead: number;
  }>> {
    const prisma = getPrisma(env);
    
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexrelid)) as size,
          idx_scan as scans,
          idx_tup_read as tuples_read
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
      ` as Array<{
        tablename: string;
        indexname: string;
        size: string;
        scans: bigint;
        tuples_read: bigint;
      }>;

      return stats.map((stat) => ({
        table: stat.tablename,
        index: stat.indexname,
        size: 0, // Would need to parse size string
        scans: Number(stat.scans),
        tuplesRead: Number(stat.tuples_read),
      }));
    } catch (error) {
      console.error("Failed to get index stats:", error);
      return [];
    }
  }
}

export const indexStrategyManager = new IndexStrategyManager();
