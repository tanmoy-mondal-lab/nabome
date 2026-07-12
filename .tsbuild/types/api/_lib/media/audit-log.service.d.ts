/**
 * Media Audit Log Service
 *
 * Provides comprehensive audit logging for all media operations.
 * Tracks uploads, renames, moves, deletions, restores, and folder operations.
 * Essential for debugging, accountability, and compliance.
 */
import type { PrismaClient } from '@prisma/client';
export type MediaAuditAction = 'upload' | 'rename' | 'move' | 'restore' | 'delete' | 'permanent_delete' | 'folder_create' | 'folder_rename' | 'folder_delete' | 'bulk_move' | 'bulk_delete' | 'bulk_restore';
export interface MediaAuditMetadata {
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    reason?: string;
    affectedAssets?: string[];
    folderPath?: string;
    oldFolderPath?: string;
    force?: boolean;
    itemCount?: number;
    skippedCount?: number;
    deletedCount?: number;
    failedCount?: number;
    error?: string;
}
export interface MediaAuditLogOptions {
    assetId: string;
    action: MediaAuditAction;
    performedBy: string;
    metadata?: MediaAuditMetadata;
    ipAddress?: string;
    userAgent?: string;
}
/**
 * Logs a media operation to the audit log
 */
export declare function logMediaOperation(prisma: PrismaClient, options: MediaAuditLogOptions): Promise<void>;
/**
 * Logs a bulk media operation with summary
 */
export declare function logBulkMediaOperation(prisma: PrismaClient, options: MediaAuditLogOptions & {
    action: 'bulk_move' | 'bulk_delete' | 'bulk_restore';
    itemCount: number;
    skippedCount?: number;
}): Promise<void>;
/**
 * Retrieves audit history for a specific asset
 */
export declare function getAssetAuditHistory(prisma: PrismaClient, assetId: string, limit?: number): Promise<any[]>;
/**
 * Retrieves audit history for a specific admin
 */
export declare function getAdminAuditHistory(prisma: PrismaClient, performedBy: string, limit?: number): Promise<any[]>;
/**
 * Retrieves recent audit logs across all assets
 */
export declare function getRecentAuditLogs(prisma: PrismaClient, limit?: number, action?: MediaAuditAction): Promise<any[]>;
/**
 * Extracts IP address and user agent from request
 */
export declare function extractRequestContext(req: Request): {
    ipAddress?: string;
    userAgent?: string;
};
