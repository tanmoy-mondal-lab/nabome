/**
 * Media Audit Log Service
 * 
 * Provides comprehensive audit logging for all media operations.
 * Tracks uploads, renames, moves, deletions, restores, and folder operations.
 * Essential for debugging, accountability, and compliance.
 */

import type { PrismaClient } from '@prisma/client';

export type MediaAuditAction =
  | 'upload'
  | 'rename'
  | 'move'
  | 'restore'
  | 'delete'
  | 'permanent_delete'
  | 'folder_create'
  | 'folder_rename'
  | 'folder_delete'
  | 'bulk_move'
  | 'bulk_delete'
  | 'bulk_restore';

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
export async function logMediaOperation(
  prisma: PrismaClient,
  options: MediaAuditLogOptions
): Promise<void> {
  try {
    await prisma.media_audit_logs.create({
      data: {
        assetId: options.assetId,
        action: options.action,
        performedBy: options.performedBy,
        metadata: options.metadata as any,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      },
    });
  } catch (error) {
    // Audit log failures should not block the main operation
    console.error('[MediaAuditLog] Failed to log operation:', error);
  }
}

/**
 * Logs a bulk media operation with summary
 */
export async function logBulkMediaOperation(
  prisma: PrismaClient,
  options: MediaAuditLogOptions & {
    action: 'bulk_move' | 'bulk_delete' | 'bulk_restore';
    itemCount: number;
    skippedCount?: number;
  }
): Promise<void> {
  await logMediaOperation(prisma, {
    ...options,
    metadata: {
      ...options.metadata,
      itemCount: options.itemCount,
      skippedCount: options.skippedCount || 0,
    },
  });
}

/**
 * Retrieves audit history for a specific asset
 */
export async function getAssetAuditHistory(
  prisma: PrismaClient,
  assetId: string,
  limit: number = 50
): Promise<any[]> {
  return prisma.media_audit_logs.findMany({
    where: { assetId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Retrieves audit history for a specific admin
 */
export async function getAdminAuditHistory(
  prisma: PrismaClient,
  performedBy: string,
  limit: number = 100
): Promise<any[]> {
  return prisma.media_audit_logs.findMany({
    where: { performedBy },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Retrieves recent audit logs across all assets
 */
export async function getRecentAuditLogs(
  prisma: PrismaClient,
  limit: number = 100,
  action?: MediaAuditAction
): Promise<any[]> {
  const where: any = {};
  if (action) {
    where.action = action;
  }

  return prisma.media_audit_logs.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Extracts IP address and user agent from request
 */
export function extractRequestContext(req: Request): {
  ipAddress?: string;
  userAgent?: string;
} {
  const ipAddress = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                    req.headers.get('x-real-ip') || undefined;
  const userAgent = req.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}
