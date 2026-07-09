import type { Env } from "./env";
export interface QueryAnalysis {
    query: string;
    executionTime: number;
    rowsAffected: number;
    indexUsed?: string;
    recommendations: string[];
}
export declare class QueryOptimizer {
    analyzeQuery(query: string, env?: Env): Promise<QueryAnalysis>;
    suggestIndexes(env?: Env): Promise<Array<{
        table: string;
        column: string;
        reason: string;
    }>>;
    analyzeTableSize(env?: Env): Promise<Array<{
        table: string;
        size: number;
        rows: number;
    }>>;
    private sanitizeQuery;
}
export declare const queryOptimizer: QueryOptimizer;
