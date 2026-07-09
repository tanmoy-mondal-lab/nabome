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

import type {
  EntityType,
  CloudinaryConfig,
  CloudinaryResourceType,
} from "./media.types";
import {
  getEntityAssets,
  assetExists,
  deleteAsset,
  listAssetsInFolder,
} from "./cloudinary.service";
import {
  parseEntityFolder,
  extractEntityFolder,
} from "../media/folder.service";
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
  missingInCloudinary: Array<{ assetId: string; publicId: string; entityType: string; entityId: string }>;
  missingInDatabase: Array<{ publicId: string; folder: string }>;
  orphanedAssets: Array<{ publicId: string; folder: string }>;
  orphanedRecords: Array<{ assetId: string; entityType: string; entityId: string }>;
  incorrectFolders: Array<{ assetId: string; expectedFolder: string; actualFolder: string }>;
  incorrectPublicIds: Array<{ assetId: string; dbPublicId: string; cloudPublicId: string }>;
  duplicateAssets: Array<{ publicId: string; count: number }>;
  duplicateRecords: Array<{ assetId: string; count: number }>;
  invalidEntityReferences: Array<{ assetId: string; entityType: string; entityId: string }>;
  brokenFolderStructure: Array<{ folder: string; reason: string }>;
  emptyFolders: Array<{ folder: string }>;
  invalidMetadata: Array<{ assetId: string; field: string; issue: string }>;
}

/**
 * Repair operation result
 */
export interface RepairResult {
  operation: string;
  success: boolean;
  assetsRepaired: number;
  assetsFailed: number;
  errors: Array<{ assetId: string; error: string }>;
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
export class MediaIntegrityService {
  private prisma: PrismaClient;
  private config: CloudinaryConfig;
  private scanHistory: Map<string, IntegrityScanResult> = new Map();
  private lastHealthCheck: MediaHealthResult | null = null;

  constructor(prisma: PrismaClient, config: CloudinaryConfig) {
    this.prisma = prisma;
    this.config = config;
  }

  /**
   * Perform a full integrity scan
   */
  async performFullScan(options: ScanOptions = {}): Promise<IntegrityScanResult> {
    const scanId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[MediaIntegrity] Starting full integrity scan: ${scanId}`);

    const issues: IntegrityIssues = {
      missingInCloudinary: [],
      missingInDatabase: [],
      orphanedAssets: [],
      orphanedRecords: [],
      incorrectFolders: [],
      incorrectPublicIds: [],
      duplicateAssets: [],
      duplicateRecords: [],
      invalidEntityReferences: [],
      brokenFolderStructure: [],
      emptyFolders: [],
      invalidMetadata: [],
    };

    let totalAssetsInCloudinary = 0;
    let totalAssetsInDatabase = 0;
    let assetsChecked = 0;

    try {
      // Get all database assets
      const dbAssets = await this.prisma.mediaAsset.findMany({
        where: options.entityType && options.entityId
          ? { entityType: options.entityType as any, entityId: options.entityId }
          : options.entityType
          ? { entityType: options.entityType as any }
          : undefined,
        select: {
          id: true,
          assetId: true,
          entityType: true,
          entityId: true,
          publicId: true,
          folder: true,
          resourceType: true,
          mimeType: true,
          width: true,
          height: true,
          fileSize: true,
          originalFilename: true,
        },
      });

      totalAssetsInDatabase = dbAssets.length;

      // Group assets by entity folder
      const assetsByEntityFolder = new Map<string, typeof dbAssets>();
      for (const asset of dbAssets) {
        if (asset.folder) {
          const entityFolder = extractEntityFolder(asset.folder);
          if (entityFolder) {
            if (!assetsByEntityFolder.has(entityFolder)) {
              assetsByEntityFolder.set(entityFolder, []);
            }
            assetsByEntityFolder.get(entityFolder)!.push(asset);
          }
        }
      }

      // Scan each entity folder
      for (const [entityFolder, assets] of assetsByEntityFolder.entries()) {
        const folderIssues = await this.scanEntityFolder(entityFolder, assets, options);
        this.mergeIssues(issues, folderIssues);
        assetsChecked += assets.length;
      }

      // Get total Cloudinary assets under nabome/
      if (options.includeOrphans !== false) {
        totalAssetsInCloudinary = await this.countCloudinaryAssets();
        
        // Check for orphaned Cloudinary assets
        const orphanIssues = await this.detectOrphanedCloudinaryAssets(dbAssets, options);
        this.mergeIssues(issues, orphanIssues);
      }

      // Check for orphaned database records
      if (options.includeOrphans !== false) {
        const orphanRecords = await this.detectOrphanedDatabaseRecords(dbAssets);
        issues.orphanedRecords = orphanRecords;
      }

      // Validate folder structure
      if (options.includeFolderValidation !== false) {
        const folderIssues = await this.validateFolderStructure(options);
        issues.brokenFolderStructure = folderIssues.broken;
        issues.emptyFolders = folderIssues.empty;
      }

      // Check for duplicates
      if (options.includeDuplicates !== false) {
        const duplicateIssues = await this.detectDuplicates(dbAssets);
        issues.duplicateAssets = duplicateIssues.cloudinary;
        issues.duplicateRecords = duplicateIssues.database;
      }

      // Validate metadata
      if (options.includeMetadataValidation !== false) {
        const metadataIssues = await this.validateMetadata(dbAssets);
        issues.invalidMetadata = metadataIssues;
      }

      const duration = Date.now() - startTime;
      const integrityScore = this.calculateIntegrityScore(issues, totalAssetsInDatabase);
      const status = this.determineStatus(integrityScore);

      const result: IntegrityScanResult = {
        scanId,
        timestamp: new Date(),
        duration,
        totalAssetsInCloudinary,
        totalAssetsInDatabase,
        assetsChecked,
        issues,
        integrityScore,
        status,
      };

      this.scanHistory.set(scanId, result);
      this.lastHealthCheck = await this.generateHealthCheck(result);

      console.log(`[MediaIntegrity] Scan complete: ${scanId} - Score: ${integrityScore}% - Status: ${status}`);

      return result;
    } catch (error) {
      console.error(`[MediaIntegrity] Scan failed: ${scanId}`, error);
      throw new Error(`Media integrity scan failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Scan a specific entity folder
   */
  private async scanEntityFolder(
    entityFolder: string,
    dbAssets: Array<{
      id: string;
      assetId: string;
      entityType: string;
      entityId: string;
      publicId: string | null;
      folder: string | null;
      resourceType: string;
      mimeType: string | null;
      width: number | null;
      height: number | null;
      fileSize: number | null;
      originalFilename: string | null;
    }>,
    _options: ScanOptions
  ): Promise<Partial<IntegrityIssues>> {
    const issues: Partial<IntegrityIssues> = {
      missingInCloudinary: [],
      missingInDatabase: [],
      incorrectFolders: [],
      incorrectPublicIds: [],
      invalidEntityReferences: [],
    };

    try {
      // Get all Cloudinary assets in this folder
      const cloudinaryAssets = await getEntityAssets(entityFolder, this.config);
      const cloudinaryMap = new Map(cloudinaryAssets.map(a => [a.publicId, a]));

      // Check each database asset
      for (const dbAsset of dbAssets) {
        if (!dbAsset.publicId) continue;

        // Check if asset exists in Cloudinary
        const cloudAsset = cloudinaryMap.get(dbAsset.publicId);
        if (!cloudAsset) {
          issues.missingInCloudinary!.push({
            assetId: dbAsset.assetId,
            publicId: dbAsset.publicId,
            entityType: dbAsset.entityType,
            entityId: dbAsset.entityId,
          });
          continue;
        }

        // Validate folder structure
        if (dbAsset.folder && cloudAsset.folder !== dbAsset.folder) {
          issues.incorrectFolders!.push({
            assetId: dbAsset.assetId,
            expectedFolder: dbAsset.folder,
            actualFolder: cloudAsset.folder || entityFolder,
          });
        }

        // Validate entity reference
        const entityExists = await this.validateEntityReference(
          dbAsset.entityType as EntityType,
          dbAsset.entityId
        );
        if (!entityExists) {
          issues.invalidEntityReferences!.push({
            assetId: dbAsset.assetId,
            entityType: dbAsset.entityType,
            entityId: dbAsset.entityId,
          });
        }
      }

      // Check for assets in Cloudinary but not in database
      const dbPublicIds = new Set(dbAssets.filter(a => a.publicId).map(a => a.publicId!));
      for (const cloudAsset of cloudinaryAssets) {
        if (!dbPublicIds.has(cloudAsset.publicId)) {
          issues.missingInDatabase!.push({
            publicId: cloudAsset.publicId,
            folder: cloudAsset.folder || entityFolder,
          });
        }
      }
    } catch (error) {
      console.error(`[MediaIntegrity] Failed to scan entity folder ${entityFolder}:`, error);
    }

    return issues;
  }

  /**
   * Detect orphaned Cloudinary assets
   */
  private async detectOrphanedCloudinaryAssets(
    dbAssets: Array<{ publicId: string | null }>,
    options: ScanOptions
  ): Promise<{ orphanedAssets: Array<{ publicId: string; folder: string }> }> {
    const orphanedAssets: Array<{ publicId: string; folder: string }> = [];
    const dbPublicIds = new Set(dbAssets.filter(a => a.publicId).map(a => a.publicId!));

    try {
      // List all assets under nabome/ root
      const maxResults = options.maxResults || 1000;
      
      // Check images
      const images = await listAssetsInFolder("nabome", "image", this.config, maxResults);
      for (const image of images) {
        if (!dbPublicIds.has(image.publicId)) {
          orphanedAssets.push({
            publicId: image.publicId,
            folder: image.folder || "nabome",
          });
        }
      }

      // Check videos
      const videos = await listAssetsInFolder("nabome", "video", this.config, maxResults);
      for (const video of videos) {
        if (!dbPublicIds.has(video.publicId)) {
          orphanedAssets.push({
            publicId: video.publicId,
            folder: video.folder || "nabome",
          });
        }
      }

      // Check raw files
      const rawFiles = await listAssetsInFolder("nabome", "raw", this.config, maxResults);
      for (const raw of rawFiles) {
        if (!dbPublicIds.has(raw.publicId)) {
          orphanedAssets.push({
            publicId: raw.publicId,
            folder: raw.folder || "nabome",
          });
        }
      }
    } catch (error) {
      console.error("[MediaIntegrity] Failed to detect orphaned Cloudinary assets:", error);
    }

    return { orphanedAssets };
  }

  /**
   * Detect orphaned database records
   */
  private async detectOrphanedDatabaseRecords(
    dbAssets: Array<{ assetId: string; entityType: string; entityId: string; publicId: string | null }>
  ): Promise<Array<{ assetId: string; entityType: string; entityId: string }>> {
    const orphanedRecords: Array<{ assetId: string; entityType: string; entityId: string }> = [];

    for (const asset of dbAssets) {
      if (!asset.publicId) {
        orphanedRecords.push({
          assetId: asset.assetId,
          entityType: asset.entityType,
          entityId: asset.entityId,
        });
        continue;
      }

      // Check if asset exists in Cloudinary
      const resourceType = this.getResourceTypeFromMimeType(asset.entityType);
      try {
        const exists = await assetExists(asset.publicId, resourceType, this.config);
        if (!exists) {
          orphanedRecords.push({
            assetId: asset.assetId,
            entityType: asset.entityType,
            entityId: asset.entityId,
          });
        }
      } catch (error) {
        // Assume asset doesn't exist if check fails
        orphanedRecords.push({
          assetId: asset.assetId,
          entityType: asset.entityType,
          entityId: asset.entityId,
        });
      }
    }

    return orphanedRecords;
  }

  /**
   * Validate folder structure
   */
  private async validateFolderStructure(
    _options: ScanOptions
  ): Promise<{ broken: Array<{ folder: string; reason: string }>; empty: Array<{ folder: string }> }> {
    const broken: Array<{ folder: string; reason: string }> = [];
    const empty: Array<{ folder: string }> = [];

    try {
      // Get all unique folders from database
      const folders = await this.prisma.mediaAsset.findMany({
        where: { folder: { not: null } },
        select: { folder: true },
        distinct: ["folder"],
      });

      for (const { folder } of folders) {
        if (!folder) continue;

        // Validate folder structure
        const parsed = parseEntityFolder(folder);
        if (!parsed) {
          broken.push({ folder, reason: "Invalid folder structure" });
          continue;
        }

        if (parsed.root !== "nabome") {
          broken.push({ folder, reason: "Invalid root folder" });
          continue;
        }

        if (!parsed.entityType) {
          broken.push({ folder, reason: "Missing entity type" });
          continue;
        }

        // Check if folder is empty (no assets)
        const assetsInFolder = await this.prisma.mediaAsset.count({
          where: { folder },
        });

        if (assetsInFolder === 0) {
          empty.push({ folder });
        }
      }
    } catch (error) {
      console.error("[MediaIntegrity] Failed to validate folder structure:", error);
    }

    return { broken, empty };
  }

  /**
   * Detect duplicates
   */
  private async detectDuplicates(
    dbAssets: Array<{ assetId: string; publicId: string | null }>
  ): Promise<{ cloudinary: Array<{ publicId: string; count: number }>; database: Array<{ assetId: string; count: number }> }> {
    const cloudinary: Array<{ publicId: string; count: number }> = [];
    const database: Array<{ assetId: string; count: number }> = [];

    // Check for duplicate asset IDs in database
    const assetIdCount = new Map<string, number>();
    for (const asset of dbAssets) {
      assetIdCount.set(asset.assetId, (assetIdCount.get(asset.assetId) || 0) + 1);
    }

    for (const [assetId, count] of assetIdCount.entries()) {
      if (count > 1) {
        database.push({ assetId, count });
      }
    }

    // Check for duplicate public IDs in database
    const publicIdCount = new Map<string, number>();
    for (const asset of dbAssets) {
      if (asset.publicId) {
        publicIdCount.set(asset.publicId, (publicIdCount.get(asset.publicId) || 0) + 1);
      }
    }

    for (const [publicId, count] of publicIdCount.entries()) {
      if (count > 1) {
        cloudinary.push({ publicId, count });
      }
    }

    return { cloudinary, database };
  }

  /**
   * Validate metadata
   */
  private async validateMetadata(
    dbAssets: Array<{
      assetId: string;
      mimeType: string | null;
      width: number | null;
      height: number | null;
      fileSize: number | null;
      resourceType: string;
    }>
  ): Promise<Array<{ assetId: string; field: string; issue: string }>> {
    const invalidMetadata: Array<{ assetId: string; field: string; issue: string }> = [];

    for (const asset of dbAssets) {
      // Validate MIME type
      if (!asset.mimeType) {
        invalidMetadata.push({ assetId: asset.assetId, field: "mimeType", issue: "Missing MIME type" });
      }

      // Validate dimensions for images
      if (asset.resourceType === "image") {
        if (!asset.width || !asset.height) {
          invalidMetadata.push({ assetId: asset.assetId, field: "dimensions", issue: "Missing dimensions for image" });
        }
      }

      // Validate file size
      if (!asset.fileSize || asset.fileSize <= 0) {
        invalidMetadata.push({ assetId: asset.assetId, field: "fileSize", issue: "Invalid or missing file size" });
      }
    }

    return invalidMetadata;
  }

  /**
   * Validate entity reference
   */
  private async validateEntityReference(entityType: EntityType, entityId: string): Promise<boolean> {
    try {
      switch (entityType) {
        case "products":
          const product = await this.prisma.product.findUnique({ where: { id: entityId } });
          return !!product;
        case "categories":
          const category = await this.prisma.category.findUnique({ where: { id: entityId } });
          return !!category;
        case "collections":
          const collection = await this.prisma.collection.findUnique({ where: { id: entityId } });
          return !!collection;
        case "brands":
          const brand = await this.prisma.brand.findUnique({ where: { id: entityId } });
          return !!brand;
        default:
          // For other entity types, assume they exist for now
          return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Count total Cloudinary assets
   */
  private async countCloudinaryAssets(): Promise<number> {
    try {
      const images = await listAssetsInFolder("nabome", "image", this.config, 500);
      const videos = await listAssetsInFolder("nabome", "video", this.config, 500);
      const rawFiles = await listAssetsInFolder("nabome", "raw", this.config, 500);
      return images.length + videos.length + rawFiles.length;
    } catch (error) {
      console.error("[MediaIntegrity] Failed to count Cloudinary assets:", error);
      return 0;
    }
  }

  /**
   * Calculate integrity score
   */
  private calculateIntegrityScore(issues: IntegrityIssues, totalAssets: number): number {
    if (totalAssets === 0) return 100;

    const issueCount =
      issues.missingInCloudinary.length +
      issues.missingInDatabase.length +
      issues.orphanedAssets.length +
      issues.orphanedRecords.length +
      issues.incorrectFolders.length +
      issues.incorrectPublicIds.length +
      issues.duplicateAssets.length +
      issues.duplicateRecords.length +
      issues.invalidEntityReferences.length +
      issues.brokenFolderStructure.length +
      issues.invalidMetadata.length;

    const score = Math.max(0, 100 - (issueCount / totalAssets) * 100);
    return Math.round(score);
  }

  /**
   * Determine status based on integrity score
   */
  private determineStatus(score: number): "healthy" | "warning" | "critical" {
    if (score >= 95) return "healthy";
    if (score >= 80) return "warning";
    return "critical";
  }

  /**
   * Merge issues
   */
  private mergeIssues(target: IntegrityIssues, source: Partial<IntegrityIssues>): void {
    if (source.missingInCloudinary) target.missingInCloudinary.push(...source.missingInCloudinary);
    if (source.missingInDatabase) target.missingInDatabase.push(...source.missingInDatabase);
    if (source.orphanedAssets) target.orphanedAssets.push(...source.orphanedAssets);
    if (source.orphanedRecords) target.orphanedRecords.push(...source.orphanedRecords);
    if (source.incorrectFolders) target.incorrectFolders.push(...source.incorrectFolders);
    if (source.incorrectPublicIds) target.incorrectPublicIds.push(...source.incorrectPublicIds);
    if (source.duplicateAssets) target.duplicateAssets.push(...source.duplicateAssets);
    if (source.duplicateRecords) target.duplicateRecords.push(...source.duplicateRecords);
    if (source.invalidEntityReferences) target.invalidEntityReferences.push(...source.invalidEntityReferences);
    if (source.brokenFolderStructure) target.brokenFolderStructure.push(...source.brokenFolderStructure);
    if (source.emptyFolders) target.emptyFolders.push(...source.emptyFolders);
    if (source.invalidMetadata) target.invalidMetadata.push(...source.invalidMetadata);
  }

  /**
   * Generate health check result
   */
  private async generateHealthCheck(scanResult: IntegrityScanResult): Promise<MediaHealthResult> {
    const totalIssues =
      scanResult.issues.missingInCloudinary.length +
      scanResult.issues.missingInDatabase.length +
      scanResult.issues.orphanedAssets.length +
      scanResult.issues.orphanedRecords.length +
      scanResult.issues.incorrectFolders.length +
      scanResult.issues.incorrectPublicIds.length +
      scanResult.issues.duplicateAssets.length +
      scanResult.issues.duplicateRecords.length +
      scanResult.issues.invalidEntityReferences.length +
      scanResult.issues.brokenFolderStructure.length;

    let status: "healthy" | "degraded" | "critical";
    if (scanResult.integrityScore >= 95 && totalIssues === 0) {
      status = "healthy";
    } else if (scanResult.integrityScore >= 80) {
      status = "degraded";
    } else {
      status = "critical";
    }

    return {
      status,
      timestamp: new Date(),
      cloudinaryAssets: scanResult.totalAssetsInCloudinary,
      databaseRecords: scanResult.totalAssetsInDatabase,
      missingAssets: scanResult.issues.missingInCloudinary.length,
      orphanAssets: scanResult.issues.orphanedAssets.length,
      duplicateAssets: scanResult.issues.duplicateAssets.length,
      brokenReferences: scanResult.issues.invalidEntityReferences.length,
      integrityScore: scanResult.integrityScore,
      lastScanTime: scanResult.timestamp,
      lastScanDuration: scanResult.duration,
    };
  }

  /**
   * Get health check result
   */
  async getHealthCheck(): Promise<MediaHealthResult> {
    if (!this.lastHealthCheck) {
      // Perform a quick scan if no previous health check exists
      const scanResult = await this.performFullScan({ maxResults: 100 });
      this.lastHealthCheck = await this.generateHealthCheck(scanResult);
    }
    return this.lastHealthCheck;
  }

  /**
   * Perform repairs
   */
  async performRepairs(issues: IntegrityIssues, options: RepairOptions = {}): Promise<RepairResult> {
    const result: RepairResult = {
      operation: "media_integrity_repair",
      success: true,
      assetsRepaired: 0,
      assetsFailed: 0,
      errors: [],
      warnings: [],
    };

    if (options.validateBeforeRepair) {
      // Validate before repair
      const validation = await this.performFullScan({ dryRun: true });
      if (validation.integrityScore < 50) {
        result.success = false;
        result.warnings.push("Integrity score too low for automatic repair. Manual intervention required.");
        return result;
      }
    }

    // Delete orphaned Cloudinary assets
    if (options.deleteOrphanedAssets && issues.orphanedAssets.length > 0) {
      for (const orphan of issues.orphanedAssets) {
        try {
          const resourceType = this.getResourceTypeFromMimeType(orphan.folder);
          const success = await deleteAsset(orphan.publicId, resourceType, this.config);
          if (success) {
            result.assetsRepaired++;
          } else {
            result.assetsFailed++;
            result.errors.push({ assetId: orphan.publicId, error: "Delete operation failed" });
          }
        } catch (error) {
          result.assetsFailed++;
          result.errors.push({
            assetId: orphan.publicId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    // Delete orphaned database records
    if (options.deleteOrphanedRecords && issues.orphanedRecords.length > 0) {
      for (const orphan of issues.orphanedRecords) {
        try {
          await this.prisma.mediaAsset.delete({
            where: { assetId: orphan.assetId },
          });
          result.assetsRepaired++;
        } catch (error) {
          result.assetsFailed++;
          result.errors.push({
            assetId: orphan.assetId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    // Remove duplicate records (keep the first one)
    if (options.removeDuplicates && issues.duplicateRecords.length > 0) {
      for (const duplicate of issues.duplicateRecords) {
        try {
          const duplicates = await this.prisma.mediaAsset.findMany({
            where: { assetId: duplicate.assetId },
            orderBy: { createdAt: "asc" },
          });
          
          // Delete all except the first one
          for (let i = 1; i < duplicates.length; i++) {
            await this.prisma.mediaAsset.delete({
              where: { id: duplicates[i].id },
            });
            result.assetsRepaired++;
          }
        } catch (error) {
          result.assetsFailed++;
          result.errors.push({
            assetId: duplicate.assetId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    return result;
  }

  /**
   * Get scan history
   */
  getScanHistory(limit: number = 10): IntegrityScanResult[] {
    return Array.from(this.scanHistory.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get scan by ID
   */
  getScanById(scanId: string): IntegrityScanResult | undefined {
    return this.scanHistory.get(scanId);
  }

  /**
   * Helper to get resource type from folder or entity type
   */
  private getResourceTypeFromMimeType(input: string): CloudinaryResourceType {
    const lower = input.toLowerCase();
    if (lower.includes("video")) return "video";
    if (lower.includes("image")) return "image";
    return "raw";
  }

  /**
   * Generate report
   */
  generateReport(scanResult: IntegrityScanResult, format: "json" | "console" = "json"): string {
    if (format === "json") {
      return JSON.stringify(scanResult, null, 2);
    }

    // Console format
    const lines = [
      "=== Media Integrity Report ===",
      `Scan ID: ${scanResult.scanId}`,
      `Timestamp: ${scanResult.timestamp.toISOString()}`,
      `Duration: ${scanResult.duration}ms`,
      "",
      "=== Summary ===",
      `Cloudinary Assets: ${scanResult.totalAssetsInCloudinary}`,
      `Database Records: ${scanResult.totalAssetsInDatabase}`,
      `Assets Checked: ${scanResult.assetsChecked}`,
      `Integrity Score: ${scanResult.integrityScore}%`,
      `Status: ${scanResult.status.toUpperCase()}`,
      "",
      "=== Issues ===",
      `Missing in Cloudinary: ${scanResult.issues.missingInCloudinary.length}`,
      `Missing in Database: ${scanResult.issues.missingInDatabase.length}`,
      `Orphaned Assets: ${scanResult.issues.orphanedAssets.length}`,
      `Orphaned Records: ${scanResult.issues.orphanedRecords.length}`,
      `Incorrect Folders: ${scanResult.issues.incorrectFolders.length}`,
      `Incorrect Public IDs: ${scanResult.issues.incorrectPublicIds.length}`,
      `Duplicate Assets: ${scanResult.issues.duplicateAssets.length}`,
      `Duplicate Records: ${scanResult.issues.duplicateRecords.length}`,
      `Invalid Entity References: ${scanResult.issues.invalidEntityReferences.length}`,
      `Broken Folder Structure: ${scanResult.issues.brokenFolderStructure.length}`,
      `Empty Folders: ${scanResult.issues.emptyFolders.length}`,
      `Invalid Metadata: ${scanResult.issues.invalidMetadata.length}`,
    ];

    return lines.join("\n");
  }
}

/**
 * Create a new Media Integrity Service instance
 */
export function createMediaIntegrityService(prisma: PrismaClient, config: CloudinaryConfig): MediaIntegrityService {
  return new MediaIntegrityService(prisma, config);
}
