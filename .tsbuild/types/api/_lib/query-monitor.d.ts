export interface QueryMetrics {
    query: string;
    duration: number;
    timestamp: number;
    success: boolean;
    error?: string;
}
export declare class QueryMonitor {
    private queries;
    private maxQueries;
    private slowQueryThreshold;
    constructor(slowQueryThreshold?: number);
    recordQuery(query: string, duration: number, success: boolean, error?: string): void;
    getSlowQueries(threshold?: number): QueryMetrics[];
    getFailedQueries(): QueryMetrics[];
    getAverageQueryTime(): number;
    getQueryStats(): {
        total: number;
        successful: number;
        failed: number;
        slow: number;
        averageTime: number;
    };
    clearLogs(): void;
    private sanitizeQuery;
}
export declare const queryMonitor: QueryMonitor;
