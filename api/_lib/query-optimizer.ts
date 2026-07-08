// ─────────────────────────────────────────────────────────────
// QUERY OPTIMIZATION UTILITY
// ─────────────────────────────────────────────────────────────
// Analyzes and optimizes database queries
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Env } from "./env";

export interface QueryAnalysis {
  query: string;
  executionTime: number;
  rowsAffected: number;
  indexUsed?: string;
  recommendations: string[];
}

export class QueryOptimizer {
  async analyzeQuery(query: string, env?: Env): Promise<QueryAnalysis> {
    const startTime = Date.now();
    const recommendations: string[] = [];

    try {
      const prisma = getPrisma(env);
      const result = await prisma.$queryRawUnsafe(query);
      const executionTime = Date.now() - startTime;
      const rowsAffected = Array.isArray(result) ? result.length : 1;

      // Analyze query for optimization opportunities
      if (query.toLowerCase().includes("select *")) {
        recommendations.push("Consider selecting only specific columns instead of using SELECT *");
      }

      if (query.toLowerCase().includes("where") && !query.toLowerCase().includes("limit")) {
        recommendations.push("Consider adding LIMIT clause to prevent large result sets");
      }

      if (executionTime > 100) {
        recommendations.push("Query execution time is high - consider adding indexes");
      }

      return {
        query: this.sanitizeQuery(query),
        executionTime,
        rowsAffected,
        recommendations,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        query: this.sanitizeQuery(query),
        executionTime,
        rowsAffected: 0,
        recommendations: ["Query failed - check syntax and permissions"],
      };
    }
  }

  async suggestIndexes(env?: Env): Promise<Array<{ table: string; column: string; reason: string }>> {
    const prisma = getPrisma(env);
    const suggestions: Array<{ table: string; column: string; reason: string }> = [];

    try {
      // Get frequently queried columns
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ` as Array<{ table_name: string }>;

      for (const table of tables) {
        // Suggest indexes for foreign key columns
        const columns = await prisma.$queryRawUnsafe(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = '${table.table_name}' 
          AND column_name LIKE '%Id'
        `) as Array<{ column_name: string }>;

        for (const col of columns) {
          suggestions.push({
            table: table.table_name,
            column: col.column_name,
            reason: "Foreign key column - consider adding index for join performance",
          });
        }
      }

      return suggestions;
    } catch (error) {
      console.error("Failed to suggest indexes:", error);
      return [];
    }
  }

  async analyzeTableSize(env?: Env): Promise<Array<{ table: string; size: number; rows: number }>> {
    const prisma = getPrisma(env);
    const results: Array<{ table: string; size: number; rows: number }> = [];

    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ` as Array<{ table_name: string }>;

      for (const table of tables) {
        const countResult = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count 
          FROM "${table.table_name}"
        `) as Array<{ count: bigint }>;
        
        results.push({
          table: table.table_name,
          size: 0, // Would need pg_relation_size for actual size
          rows: Number(countResult[0].count),
        });
      }

      return results;
    } catch (error) {
      console.error("Failed to analyze table sizes:", error);
      return [];
    }
  }

  private sanitizeQuery(query: string): string {
    return query.substring(0, 500);
  }
}

export const queryOptimizer = new QueryOptimizer();
