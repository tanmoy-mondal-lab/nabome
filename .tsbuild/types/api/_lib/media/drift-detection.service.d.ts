/**
 * Media Drift Detection Service
 *
 * Detects and reports inconsistencies between the database and Cloudinary.
 * Helps maintain long-term consistency by identifying:
 * - Orphaned Cloudinary assets (exist in Cloudinary but not in DB)
 * - Missing Cloudinary assets (exist in DB but not in Cloudinary)
 * - Metadata mismatches
 */
import type { PrismaClient } from '@prisma/client';
import type { CloudinaryConfig } from './types';
export interface DriftReport {
    timestamp: string;
    totalAssets: number;
    orphanedInCloudinary: Array<{
        publicId: string;
        resourceType: string;
    }>;
    missingInCloudinary: Array<{
        assetId: string;
        publicId: string;
        resourceType: string;
    }>;
    metadataMismatches: Array<{
        assetId: string;
        publicId: string;
        field: string;
        dbValue: unknown;
        cloudinaryValue: unknown;
    }>;
}
/**
 * Performs drift detection between database and Cloudinary
 */
export declare function detectDrift(prisma: PrismaClient, config: CloudinaryConfig): Promise<DriftReport>;
/**
 * Repairs drift by updating database to match Cloudinary
 */
export declare function repairDrift(prisma: PrismaClient, report: DriftReport): Promise<{
    repaired: number;
    failed: number;
}>;
/**
 * Schedules periodic drift detection (for background jobs)
 */
export declare function scheduleDriftDetection(prisma: PrismaClient, config: CloudinaryConfig, intervalMs?: number): () => void;
