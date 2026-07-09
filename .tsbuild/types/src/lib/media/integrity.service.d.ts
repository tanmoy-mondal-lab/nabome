/**
 * Media Integrity Service
 *
 * This service provides comprehensive media integrity verification, monitoring, and self-healing capabilities.
 * It ensures Cloudinary and the database remain synchronized by detecting and repairing inconsistencies.
 *
 * Core Responsibilities:
 * - Verify Cloudinary assets (existence, metadata, folder hierarchy)
 * - Verify database records (entity references, metadata consistency)
 * - Detect orphaned assets and records
 * - Detect duplicates and inconsistencies
 * - Validate folder hierarchy structure
 * - Perform safe repairs where possible
 * - Generate integrity reports and scores
 * - Support scheduled verification
 */
import type { EntityType, CloudinaryConfig } from "./media.types";
import type { PrismaClient } from "@prisma/client";
/**
 * Integrity check result for a single asset
 */
export interface AssetIntegrityCheck {
    assetId: string;
    publicId: string;
    inCloudinary: boolean;
    inDatabase: boolean;
    folderValid: boolean;
    entityExists: boolean;
    metadataMatch: boolean;
    issues: string[];
}
/**
 * Full integrity scan result
 */
export interface IntegrityScanResult {
    scanId: string;
    timestamp: Date;
    duration: number;
    totalAssetsInCloudinary: number;
    totalAssetsInDatabase: number;
    assetsChecked: number;
    issues: IntegrityIssues;
    integrityScore: number;
    status: "healthy" | "warning" | "critical";
}
/**
 * Detected integrity issues
 */
export interface IntegrityIssues {
    missingInCloudinary: Array<{
        assetId: string;
        publicId: string;
        entityType: string;
        entityId: string;
    }>;
    missingInDatabase: Array<{
        publicId: string;
        folder: string;
    }>;
    orphanedAssets: Array<{
        publicId: string;
        folder: string;
    }>;
    orphanedRecords: Array<{
        assetId: string;
        entityType: string;
        entityId: string;
    }>;
    incorrectFolders: Array<{
        assetId: string;
        expectedFolder: string;
        actualFolder: string;
    }>;
    incorrectPublicIds: Array<{
        assetId: string;
        dbPublicId: string;
        cloudPublicId: string;
    }>;
    duplicateAssets: Array<{
        publicId: string;
        count: number;
    }>;
    duplicateRecords: Array<{
        assetId: string;
        count: number;
    }>;
    invalidEntityReferences: Array<{
        assetId: string;
        entityType: string;
        entityId: string;
    }>;
    brokenFolderStructure: Array<{
        folder: string;
        reason: string;
    }>;
    emptyFolders: Array<{
        folder: string;
    }>;
    invalidMetadata: Array<{
        assetId: string;
        field: string;
        issue: string;
    }>;
}
/**
 * Repair operation result
 */
export interface RepairResult {
    operation: string;
    success: boolean;
    assetsRepaired: number;
    assetsFailed: number;
    errors: Array<{
        assetId: string;
        error: string;
    }>;
    warnings: string[];
}
/**
 * Health check result
 */
export interface MediaHealthResult {
    status: "healthy" | "degraded" | "critical";
    timestamp: Date;
    cloudinaryAssets: number;
    databaseRecords: number;
    missingAssets: number;
    orphanAssets: number;
    duplicateAssets: number;
    brokenReferences: number;
    integrityScore: number;
    lastScanTime: Date | null;
    lastScanDuration: number | null;
}
/**
 * Scan options
 */
export interface ScanOptions {
    entityType?: EntityType;
    entityId?: string;
    includeOrphans?: boolean;
    includeDuplicates?: boolean;
    includeFolderValidation?: boolean;
    includeMetadataValidation?: boolean;
    maxResults?: number;
    dryRun?: boolean;
}
/**
 * Repair options
 */
export interface RepairOptions {
    deleteOrphanedAssets?: boolean;
    deleteOrphanedRecords?: boolean;
    fixIncorrectFolders?: boolean;
    fixIncorrectPublicIds?: boolean;
    removeDuplicates?: boolean;
    validateBeforeRepair?: boolean;
    createBackup?: boolean;
}
/**
 * Media Integrity Service class
 */
export declare class MediaIntegrityService {
    private prisma;
    private config;
    private scanHistory;
    private lastHealthCheck;
    constructor(prisma: PrismaClient, config: CloudinaryConfig);
    /**
     * Perform a full integrity scan
     */
    performFullScan(options?: ScanOptions): Promise<IntegrityScanResult>;
    /**
     * Scan a specific entity folder
     */
    private scanEntityFolder;
    /**
     * Detect orphaned Cloudinary assets
     */
    private detectOrphanedCloudinaryAssets;
    /**
     * Detect orphaned database records
     */
    private detectOrphanedDatabaseRecords;
    /**
     * Validate folder structure
     */
    private validateFolderStructure;
    /**
     * Detect duplicates
     */
    private detectDuplicates;
    /**
     * Validate metadata
     */
    private validateMetadata;
    /**
     * Validate entity reference
     */
    private validateEntityReference;
    /**
     * Count total Cloudinary assets
     */
    private countCloudinaryAssets;
    /**
     * Calculate integrity score
     */
    private calculateIntegrityScore;
    /**
     * Determine status based on integrity score
     */
    private determineStatus;
    /**
     * Merge issues
     */
    private mergeIssues;
    /**
     * Generate health check result
     */
    private generateHealthCheck;
    /**
     * Get health check result
     */
    getHealthCheck(): Promise<MediaHealthResult>;
    /**
     * Perform repairs
     */
    performRepairs(issues: IntegrityIssues, options?: RepairOptions): Promise<RepairResult>;
    /**
     * Get scan history
     */
    getScanHistory(limit?: number): IntegrityScanResult[];
    /**
     * Get scan by ID
     */
    getScanById(scanId: string): IntegrityScanResult | undefined;
    /**
     * Helper to get resource type from folder or entity type
     */
    private getResourceTypeFromMimeType;
    /**
     * Generate report
     */
    generateReport(scanResult: IntegrityScanResult, format?: "json" | "console"): string;
}
/**
 * Create a new Media Integrity Service instance
 */
export declare function createMediaIntegrityService(prisma: PrismaClient, config: CloudinaryConfig): MediaIntegrityService;
