/**
 * Media Bulk Operations Service
 *
 * Provides safe bulk operations for media management.
 * Ensures that bulk operations don't fail entirely because of individual asset failures.
 * Provides detailed summaries of what succeeded and what failed.
 */
import type { PrismaClient } from '@prisma/client';
import type { CloudinaryConfig } from './types';
export interface BulkDeleteResult {
    total: number;
    deleted: number;
    skipped: number;
    failed: number;
    details: Array<{
        assetId: string;
        status: 'deleted' | 'skipped' | 'failed';
        reason?: string;
    }>;
}
export interface BulkDeleteOptions {
    assetIds: string[];
    performedBy: string;
    reason?: string;
    req?: Request;
    force?: boolean;
}
/**
 * Bulk delete with safety - continues even if individual assets fail
 */
export declare function bulkDeleteWithSafety(prisma: PrismaClient, _config: CloudinaryConfig, options: BulkDeleteOptions): Promise<BulkDeleteResult>;
/**
 * Bulk restore with safety
 */
export declare function bulkRestoreWithSafety(prisma: PrismaClient, options: {
    assetIds: string[];
    performedBy: string;
    req?: Request;
}): Promise<BulkDeleteResult>;
/**
 * Bulk permanent delete with safety
 */
export declare function bulkPermanentDeleteWithSafety(prisma: PrismaClient, config: CloudinaryConfig, options: {
    assetIds: string[];
    performedBy: string;
    reason?: string;
    req?: Request;
}): Promise<BulkDeleteResult>;
