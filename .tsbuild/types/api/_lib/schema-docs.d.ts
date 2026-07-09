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
export declare class SchemaDocumentationGenerator {
    generateDocumentation(env?: Env): Promise<{
        tables: TableDocumentation[];
        generatedAt: string;
    }>;
    private generateTableDocumentation;
    private getTableColumns;
    private getTableIndexes;
    private getTableRelations;
    exportMarkdown(env?: Env): Promise<string>;
}
export declare const schemaDocsGenerator: SchemaDocumentationGenerator;
