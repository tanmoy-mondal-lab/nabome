import type { Env } from "./env";
export interface IndexRecommendation {
    table: string;
    column: string;
    type: "btree" | "hash" | "gin" | "gist";
    reason: string;
    priority: "high" | "medium" | "low";
}
export declare class IndexStrategyManager {
    analyzeIndexUsage(env?: Env): Promise<{
        unusedIndexes: Array<{
            table: string;
            index: string;
        }>;
        missingIndexes: IndexRecommendation[];
    }>;
    createIndex(table: string, column: string, type?: "btree" | "hash" | "gin" | "gist", unique?: boolean, env?: Env): Promise<boolean>;
    dropIndex(_table: string, index: string, env?: Env): Promise<boolean>;
    rebuildIndex(index: string, env?: Env): Promise<boolean>;
    getIndexStats(env?: Env): Promise<Array<{
        table: string;
        index: string;
        size: number;
        scans: number;
        tuplesRead: number;
    }>>;
}
export declare const indexStrategyManager: IndexStrategyManager;
