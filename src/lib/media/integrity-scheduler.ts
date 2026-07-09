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
import { createMediaIntegrityService, type IntegrityScanResult, type MediaHealthResult } from "./integrity.service";

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
export const DEFAULT_SCHEDULES: Record<string, ScheduleConfig> = {
  development: {
    enabled: false, // Manual execution in development
    intervalMinutes: 60,
    autoRepair: false,
    maxResults: 100,
    includeOrphans: true,
    includeDuplicates: true,
    includeFolderValidation: true,
    includeMetadataValidation: true,
    verboseLogging: true,
  },
  production: {
    enabled: true,
    intervalMinutes: 1440, // Daily scans
    autoRepair: false, // Require manual approval for repairs
    maxResults: 1000,
    includeOrphans: true,
    includeDuplicates: true,
    includeFolderValidation: true,
    includeMetadataValidation: true,
    verboseLogging: false,
  },
};

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
export class MediaIntegrityScheduler {
  private prisma: PrismaClient;
  private config: CloudinaryConfig;
  private scheduleConfig: ScheduleConfig;
  private integrityService: ReturnType<typeof createMediaIntegrityService>;
  private timer: NodeJS.Timeout | null = null;
  private scanHistory: ScheduledScanResult[] = [];
  private isRunning: boolean = false;

  constructor(
    prisma: PrismaClient,
    config: CloudinaryConfig,
    scheduleConfig: Partial<ScheduleConfig> = {}
  ) {
    this.prisma = prisma;
    this.config = config;
    this.integrityService = createMediaIntegrityService(prisma, config);
    
    // Determine environment and use appropriate default
    const environment = process.env.NODE_ENV || "development";
    const defaultConfig = DEFAULT_SCHEDULES[environment] || DEFAULT_SCHEDULES.development;
    
    this.scheduleConfig = {
      ...defaultConfig,
      ...scheduleConfig,
    };
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (!this.scheduleConfig.enabled) {
      console.log("[MediaIntegrityScheduler] Scheduler is disabled in current configuration");
      return;
    }

    if (this.isRunning) {
      console.log("[MediaIntegrityScheduler] Scheduler is already running");
      return;
    }

    console.log(`[MediaIntegrityScheduler] Starting scheduler with interval: ${this.scheduleConfig.intervalMinutes} minutes`);
    
    // Schedule first run
    this.scheduleNextRun();
    this.isRunning = true;
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log("[MediaIntegrityScheduler] Scheduler stopped");
  }

  /**
   * Schedule the next run
   */
  private scheduleNextRun(): void {
    const intervalMs = this.scheduleConfig.intervalMinutes * 60 * 1000;
    
    this.timer = setTimeout(() => {
      this.runScheduledScan().then(() => {
        if (this.isRunning) {
          this.scheduleNextRun();
        }
      });
    }, intervalMs);
  }

  /**
   * Run a scheduled scan
   */
  private async runScheduledScan(): Promise<ScheduledScanResult> {
    console.log(`[MediaIntegrityScheduler] Running scheduled scan at ${new Date().toISOString()}`);
    
    const result: ScheduledScanResult = {
      scanId: crypto.randomUUID(),
      timestamp: new Date(),
      duration: 0,
      integrityScore: 0,
      status: "healthy",
      issuesDetected: 0,
      autoRepaired: 0,
      errors: [],
    };

    const startTime = Date.now();

    try {
      // Perform the scan
      const scanResult = await this.integrityService.performFullScan({
        includeOrphans: this.scheduleConfig.includeOrphans,
        includeDuplicates: this.scheduleConfig.includeDuplicates,
        includeFolderValidation: this.scheduleConfig.includeFolderValidation,
        includeMetadataValidation: this.scheduleConfig.includeMetadataValidation,
        maxResults: this.scheduleConfig.maxResults,
      });

      result.duration = Date.now() - startTime;
      result.integrityScore = scanResult.integrityScore;
      result.status = scanResult.status;

      // Count total issues
      result.issuesDetected =
        scanResult.issues.missingInCloudinary.length +
        scanResult.issues.missingInDatabase.length +
        scanResult.issues.orphanedAssets.length +
        scanResult.issues.orphanedRecords.length +
        scanResult.issues.incorrectFolders.length +
        scanResult.issues.incorrectPublicIds.length +
        scanResult.issues.duplicateAssets.length +
        scanResult.issues.duplicateRecords.length +
        scanResult.issues.invalidEntityReferences.length +
        scanResult.issues.brokenFolderStructure.length +
        scanResult.issues.invalidMetadata.length;

      // Log results
      if (this.scheduleConfig.verboseLogging) {
        console.log(`[MediaIntegrityScheduler] Scan complete:`, {
          scanId: result.scanId,
          duration: result.duration,
          integrityScore: result.integrityScore,
          status: result.status,
          issuesDetected: result.issuesDetected,
        });
      }

      // Auto-repair if enabled and safe
      if (this.scheduleConfig.autoRepair && result.integrityScore >= 80) {
        try {
          const repairResult = await this.integrityService.performRepairs(scanResult.issues, {
            deleteOrphanedAssets: true,
            deleteOrphanedRecords: true,
            removeDuplicates: true,
            validateBeforeRepair: true,
          });
          
          result.autoRepaired = repairResult.assetsRepaired;
          
          if (repairResult.assetsRepaired > 0) {
            console.log(`[MediaIntegrityScheduler] Auto-repaired ${repairResult.assetsRepaired} assets`);
          }
        } catch (error) {
          result.errors.push(`Auto-repair failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Store in history
      this.scanHistory.push(result);
      
      // Keep only last 100 scans
      if (this.scanHistory.length > 100) {
        this.scanHistory.shift();
      }

      // Alert if critical
      if (result.status === "critical") {
        console.error(`[MediaIntegrityScheduler] CRITICAL: Media integrity score is ${result.integrityScore}%`);
        // In production, you would send an alert here (email, Slack, etc.)
      }

    } catch (error) {
      result.duration = Date.now() - startTime;
      result.errors.push(error instanceof Error ? error.message : String(error));
      console.error("[MediaIntegrityScheduler] Scheduled scan failed:", error);
    }

    return result;
  }

  /**
   * Run a manual scan immediately
   */
  async runManualScan(options?: Partial<ScheduleConfig>): Promise<ScheduledScanResult> {
    const originalConfig = { ...this.scheduleConfig };
    
    if (options) {
      this.scheduleConfig = { ...this.scheduleConfig, ...options };
    }

    const result = await this.runScheduledScan();
    
    // Restore original config
    this.scheduleConfig = originalConfig;

    return result;
  }

  /**
   * Get scan history
   */
  getScanHistory(limit: number = 10): ScheduledScanResult[] {
    return this.scanHistory.slice(-limit);
  }

  /**
   * Get current schedule configuration
   */
  getScheduleConfig(): ScheduleConfig {
    return { ...this.scheduleConfig };
  }

  /**
   * Update schedule configuration
   */
  updateScheduleConfig(config: Partial<ScheduleConfig>): void {
    this.scheduleConfig = { ...this.scheduleConfig, ...config };
    
    // Restart scheduler if interval changed
    if (config.intervalMinutes && this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    enabled: boolean;
    intervalMinutes: number;
    nextRun: Date | null;
    lastRun: ScheduledScanResult | null;
  } {
    const lastRun = this.scanHistory[this.scanHistory.length - 1] || null;
    
    return {
      isRunning: this.isRunning,
      enabled: this.scheduleConfig.enabled,
      intervalMinutes: this.scheduleConfig.intervalMinutes,
      nextRun: this.timer ? new Date(Date.now() + this.scheduleConfig.intervalMinutes * 60 * 1000) : null,
      lastRun,
    };
  }

  /**
   * Get health check result
   */
  async getHealthCheck(): Promise<MediaHealthResult> {
    return this.integrityService.getHealthCheck();
  }
}

/**
 * Create a new Media Integrity Scheduler instance
 */
export function createMediaIntegrityScheduler(
  prisma: PrismaClient,
  config: CloudinaryConfig,
  scheduleConfig?: Partial<ScheduleConfig>
): MediaIntegrityScheduler {
  return new MediaIntegrityScheduler(prisma, config, scheduleConfig);
}

/**
 * Initialize scheduler from environment variables
 */
export function initializeSchedulerFromEnv(
  prisma: PrismaClient,
  config: CloudinaryConfig
): MediaIntegrityScheduler {
  const environment = process.env.NODE_ENV || "development";
  
  const scheduleConfig: Partial<ScheduleConfig> = {
    enabled: process.env.MEDIA_INTEGRITY_ENABLED === "true",
    intervalMinutes: parseInt(process.env.MEDIA_INTEGRITY_INTERVAL_MINUTES || "1440"),
    autoRepair: process.env.MEDIA_INTEGRITY_AUTO_REPAIR === "true",
    maxResults: parseInt(process.env.MEDIA_INTEGRITY_MAX_RESULTS || "1000"),
    includeOrphans: process.env.MEDIA_INTEGRITY_INCLUDE_ORPHANS !== "false",
    includeDuplicates: process.env.MEDIA_INTEGRITY_INCLUDE_DUPLICATES !== "false",
    includeFolderValidation: process.env.MEDIA_INTEGRITY_INCLUDE_FOLDER_VALIDATION !== "false",
    includeMetadataValidation: process.env.MEDIA_INTEGRITY_INCLUDE_METADATA_VALIDATION !== "false",
    verboseLogging: process.env.MEDIA_INTEGRITY_VERBOSE_LOGGING === "true",
  };

  return createMediaIntegrityScheduler(prisma, config, scheduleConfig);
}
