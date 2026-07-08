// ─────────────────────────────────────────────────────────────
// AUDIT TRAIL UTILITY
// ─────────────────────────────────────────────────────────────
// Tracks and manages audit logs for data changes
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Env } from "./env";

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

export class AuditTrailManager {
  async logAction(
    action: string,
    entity: string,
    entityId: string,
    options: {
      userId?: string;
      changes?: Record<string, { old: any; new: any }>;
      metadata?: Record<string, any>;
      ipAddress?: string;
    } = {},
    env?: Env
  ): Promise<boolean> {
    const prisma = getPrisma(env);

    try {
      // Check if UserActionLog table exists
      const tableExists = await this.tableExists(prisma, "UserActionLog");
      
      if (!tableExists) {
        console.warn("UserActionLog table does not exist - audit logging disabled");
        return false;
      }

      await prisma.userActionLog.create({
        data: {
          action,
          entity,
          entityId,
          metadata: {
            ...options.metadata,
            userId: options.userId,
          },
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to log audit action:", error);
      return false;
    }
  }

  async getAuditLogs(
    filters: {
      entity?: string;
      entityId?: string;
      userId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {},
    env?: Env
  ): Promise<AuditLogEntry[]> {
    const prisma = getPrisma(env);

    try {
      const where: any = {};

      if (filters.entity) where.entity = filters.entity;
      if (filters.entityId) where.entityId = filters.entityId;
      if (filters.userId) where.userId = filters.userId;
      if (filters.action) where.action = filters.action;
      
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const logs = await prisma.userActionLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit || 100,
      });

      return logs.map((log: any) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        userId: log.userId,
        metadata: log.metadata,
        timestamp: log.createdAt,
      }));
    } catch (error) {
      console.error("Failed to get audit logs:", error);
      return [];
    }
  }

  async getAuditTrail(
    entity: string,
    entityId: string,
    env?: Env
  ): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ entity, entityId }, env);
  }

  async getUserActivity(
    userId: string,
    limit = 50,
    env?: Env
  ): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ userId, limit }, env);
  }

  async cleanupOldLogs(daysToKeep = 90, env?: Env): Promise<number> {
    const prisma = getPrisma(env);

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.userActionLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error("Failed to cleanup old audit logs:", error);
      return 0;
    }
  }

  private async tableExists(prisma: any, tableName: string): Promise<boolean> {
    try {
      const result = await prisma.$queryRawUnsafe(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = '${tableName}'
        )
      `) as Array<{ exists: boolean }>;

      return result[0].exists;
    } catch {
      return false;
    }
  }
}

export const auditTrailManager = new AuditTrailManager();
