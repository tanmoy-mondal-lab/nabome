import type { Env } from "./env";
export interface HealthCheckResult {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    checks: {
        database: HealthCheckItem;
        cache?: HealthCheckItem;
        externalServices?: HealthCheckItem;
    };
    metrics: SystemMetrics;
}
export interface HealthCheckItem {
    status: "pass" | "fail" | "warn";
    message: string;
    responseTime?: number;
    lastChecked: string;
}
export interface SystemMetrics {
    uptime: number;
    memoryUsage?: number;
    requestCount?: number;
    errorRate?: number;
    averageResponseTime?: number;
}
export declare class HealthMonitor {
    private startTime;
    private requestCount;
    private errorCount;
    private responseTimes;
    private maxResponseTimes;
    constructor();
    recordRequest(duration: number, isError: boolean): void;
    getMetrics(): SystemMetrics;
    checkDatabase(env?: Env): Promise<HealthCheckItem>;
    getHealthStatus(env?: Env): Promise<HealthCheckResult>;
    resetMetrics(): void;
}
export declare const healthMonitor: HealthMonitor;
