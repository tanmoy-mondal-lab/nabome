// ─────────────────────────────────────────────────────────────
// HEALTH MONITORING UTILITY
// ─────────────────────────────────────────────────────────────
// System health checks and metrics collection
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
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

export class HealthMonitor {
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];
  private maxResponseTimes: number = 100;

  constructor() {
    this.startTime = Date.now();
  }

  recordRequest(duration: number, isError: boolean): void {
    this.requestCount++;
    if (isError) {
      this.errorCount++;
    }
    this.responseTimes.push(duration);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes.shift();
    }
  }

  getMetrics(): SystemMetrics {
    const uptime = Date.now() - this.startTime;
    const averageResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      : 0;
    const errorRate = this.requestCount > 0
      ? (this.errorCount / this.requestCount) * 100
      : 0;

    return {
      uptime,
      requestCount: this.requestCount,
      errorRate,
      averageResponseTime,
    };
  }

  async checkDatabase(env?: Env): Promise<HealthCheckItem> {
    const startTime = Date.now();
    try {
      const prisma = getPrisma(env);
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        status: "pass",
        message: "Database connection successful",
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: "fail",
        message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  async getHealthStatus(env?: Env): Promise<HealthCheckResult> {
    const dbCheck = await this.checkDatabase(env);
    
    const overallStatus = dbCheck.status === "pass" ? "healthy" : "unhealthy";
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck,
      },
      metrics: this.getMetrics(),
    };
  }

  resetMetrics(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
  }
}

// Global health monitor instance
export const healthMonitor = new HealthMonitor();
