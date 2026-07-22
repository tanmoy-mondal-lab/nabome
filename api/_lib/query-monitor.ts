// ─────────────────────────────────────────────────────────────
// QUERY MONITORING UTILITY
// ─────────────────────────────────────────────────────────────
// Monitors database query performance and logs slow queries
// ─────────────────────────────────────────────────────────────

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

import { logger } from "./logger";

export class QueryMonitor {
  private queries: QueryMetrics[] = [];
  private maxQueries: number = 1000;
  private slowQueryThreshold: number = 1000; // 1 second

  constructor(slowQueryThreshold?: number) {
    if (slowQueryThreshold) {
      this.slowQueryThreshold = slowQueryThreshold;
    }
  }

  recordQuery(query: string, duration: number, success: boolean, error?: string): void {
    const metrics: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: Date.now(),
      success,
      error,
    };

    this.queries.push(metrics);

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.warn(`Slow query detected (${duration}ms):`, { query });
    }

    // Rotate logs if needed
    if (this.queries.length > this.maxQueries) {
      this.queries.shift();
    }
  }

  getSlowQueries(threshold?: number): QueryMetrics[] {
    const limit = threshold || this.slowQueryThreshold;
    return this.queries.filter((q) => q.duration > limit);
  }

  getFailedQueries(): QueryMetrics[] {
    return this.queries.filter((q) => !q.success);
  }

  getAverageQueryTime(): number {
    if (this.queries.length === 0) return 0;
    const total = this.queries.reduce((sum, q) => sum + q.duration, 0);
    return total / this.queries.length;
  }

  getQueryStats(): {
    total: number;
    successful: number;
    failed: number;
    slow: number;
    averageTime: number;
  } {
    const successful = this.queries.filter((q) => q.success).length;
    const failed = this.queries.filter((q) => !q.success).length;
    const slow = this.queries.filter((q) => q.duration > this.slowQueryThreshold).length;

    return {
      total: this.queries.length,
      successful,
      failed,
      slow,
      averageTime: this.getAverageQueryTime(),
    };
  }

  clearLogs(): void {
    this.queries = [];
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data from query logs
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='***'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret='***'")
      .substring(0, 500); // Limit query length
  }
}

// Global query monitor instance
export const queryMonitor = new QueryMonitor();
