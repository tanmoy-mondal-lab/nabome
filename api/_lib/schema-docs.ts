// ─────────────────────────────────────────────────────────────
// SCHEMA DOCUMENTATION GENERATOR
// ─────────────────────────────────────────────────────────────
// Generates documentation for database schema
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Env } from "./env";

export interface TableDocumentation {
  name: string;
  description?: string;
  columns: ColumnDocumentation[];
  indexes: IndexDocumentation[];
  relations: RelationDocumentation[];
}

export interface ColumnDocumentation {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  description?: string;
}

export interface IndexDocumentation {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface RelationDocumentation {
  type: "one-to-one" | "one-to-many" | "many-to-many";
  with: string;
  foreignKey?: string;
}

export class SchemaDocumentationGenerator {
  async generateDocumentation(env?: Env): Promise<{
    tables: TableDocumentation[];
    generatedAt: string;
  }> {
    const prisma = getPrisma(env);
    const tables: TableDocumentation[] = [];

    try {
      const tableNames = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      ` as Array<{ table_name: string }>;

      for (const table of tableNames) {
        const tableDoc = await this.generateTableDocumentation(prisma, table.table_name);
        tables.push(tableDoc);
      }

      return {
        tables,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to generate schema documentation:", error);
      return {
        tables: [],
        generatedAt: new Date().toISOString(),
      };
    }
  }

  private async generateTableDocumentation(prisma: any, tableName: string): Promise<TableDocumentation> {
    const columns = await this.getTableColumns(prisma, tableName);
    const indexes = await this.getTableIndexes(prisma, tableName);
    const relations = await this.getTableRelations(prisma, tableName);

    return {
      name: tableName,
      columns,
      indexes,
      relations,
    };
  }

  private async getTableColumns(prisma: any, tableName: string): Promise<ColumnDocumentation[]> {
    const columns = await prisma.$queryRawUnsafe(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = '${tableName}'
      ORDER BY ordinal_position
    `) as Array<{
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }>;

    return columns.map((col) => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === "YES",
      default: col.column_default || undefined,
    }));
  }

  private async getTableIndexes(prisma: any, tableName: string): Promise<IndexDocumentation[]> {
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT 
        indexname as name,
        indexdef as definition
      FROM pg_indexes
      WHERE tablename = '${tableName}'
    `) as Array<{ name: string; definition: string }>;

    return indexes.map((idx) => {
      const columnsMatch = idx.definition.match(/\(([^)]+)\)/);
      const columns = columnsMatch ? columnsMatch[1].split(", ").map((c) => c.replace(/"/g, "")) : [];
      const unique = idx.definition.toLowerCase().includes("unique");

      return {
        name: idx.name,
        columns,
        unique,
      };
    });
  }

  private async getTableRelations(prisma: any, tableName: string): Promise<RelationDocumentation[]> {
    // This would need to be implemented based on actual foreign key constraints
    // For now, return empty array
    return [];
  }

  async exportMarkdown(env?: Env): Promise<string> {
    const docs = await this.generateDocumentation(env);
    
    let markdown = "# Database Schema Documentation\n\n";
    markdown += `Generated on: ${docs.generatedAt}\n\n`;

    for (const table of docs.tables) {
      markdown += `## ${table.name}\n\n`;
      
      if (table.columns.length > 0) {
        markdown += "### Columns\n\n";
        markdown += "| Name | Type | Nullable | Default |\n";
        markdown += "|------|------|----------|----------|\n";
        
        for (const col of table.columns) {
          markdown += `| ${col.name} | ${col.type} | ${col.nullable ? "Yes" : "No"} | ${col.default || "-"} |\n`;
        }
        markdown += "\n";
      }

      if (table.indexes.length > 0) {
        markdown += "### Indexes\n\n";
        for (const idx of table.indexes) {
          markdown += `- **${idx.name}**: ${idx.columns.join(", ")} ${idx.unique ? "(Unique)" : ""}\n`;
        }
        markdown += "\n";
      }

      markdown += "---\n\n";
    }

    return markdown;
  }
}

export const schemaDocsGenerator = new SchemaDocumentationGenerator();
