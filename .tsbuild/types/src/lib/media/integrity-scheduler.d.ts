/**
 * Media Integrity Scheduler
 *
 * This service provides scheduled verification capabilities for the Media Integrity System.
 * It supports configurable schedules for development and production environments.
 *
 * Features:
 * - Configurable scan intervals (cron-like scheduling)
 * - Automatic health checks
 * - Optional auto-repair for safe operations
 * - Logging and reporting
 * - Environment-specific configurations
 */
import type { PrismaClient } from "@prisma/client";
import type { CloudinaryConfig } from "./media.types";
import { type MediaHealthResult } from "./integrity.service";
/**
 * Schedule configuration
 */
export interface ScheduleConfig {
    /** Enable scheduled scans */
    enabled: boolean;
    /** Scan interval in minutes */
    intervalMinutes: number;
    /** Enable auto-repair for safe operations */
    autoRepair?: boolean;
    /** Maximum number of assets to scan per run */
    maxResults?: number;
    /** Include orphan detection */
    includeOrphans?: boolean;
    /** Include duplicate detection */
    includeDuplicates?: boolean;
    /** Include folder validation */
    includeFolderValidation?: boolean;
    /** Include metadata validation */
    includeMetadataValidation?: boolean;
    /** Log detailed results */
    verboseLogging?: boolean;
}
/**
 * Default configurations for different environments
 */
export declare const DEFAULT_SCHEDULES: Record<string, ScheduleConfig>;
/**
 * Scheduled scan result
 */
export interface ScheduledScanResult {
    scanId: string;
    timestamp: Date;
    duration: number;
    integrityScore: number;
    status: "healthy" | "warning" | "critical";
    issuesDetected: number;
    autoRepaired: number;
    errors: string[];
}
/**
 * Media Integrity Scheduler class
 */
export declare class MediaIntegrityScheduler {
    private scheduleConfig;
    private integrityService;
    private timer;
    private scanHistory;
    private isRunning;
    constructor(prisma: PrismaClient, config: CloudinaryConfig, scheduleConfig?: Partial<ScheduleConfig>);
    /**
     * Start the scheduler
     */
    start(): void;
    /**
     * Stop the scheduler
     */
    stop(): void;
    /**
     * Schedule the next run
     */
    private scheduleNextRun;
    /**
     * Run a scheduled scan
     */
    private runScheduledScan;
    /**
     * Run a manual scan immediately
     */
    runManualScan(options?: Partial<ScheduleConfig>): Promise<ScheduledScanResult>;
    /**
     * Get scan history
     */
    getScanHistory(limit?: number): ScheduledScanResult[];
    /**
     * Get current schedule configuration
     */
    getScheduleConfig(): ScheduleConfig;
    /**
     * Update schedule configuration
     */
    updateScheduleConfig(config: Partial<ScheduleConfig>): void;
    /**
     * Get scheduler status
     */
    getStatus(): {
        isRunning: boolean;
        enabled: boolean;
        intervalMinutes: number;
        nextRun: Date | null;
        lastRun: ScheduledScanResult | null;
    };
    /**
     * Get health check result
     */
    getHealthCheck(): Promise<MediaHealthResult>;
}
/**
 * Create a new Media Integrity Scheduler instance
 */
export declare function createMediaIntegrityScheduler(prisma: PrismaClient, config: CloudinaryConfig, scheduleConfig?: Partial<ScheduleConfig>): MediaIntegrityScheduler;
/**
 * Initialize scheduler from environment variables
 */
export declare function initializeSchedulerFromEnv(prisma: PrismaClient, config: CloudinaryConfig): MediaIntegrityScheduler;
