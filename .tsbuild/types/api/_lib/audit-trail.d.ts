import type { Env } from "./env";
export interface AuditLogEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    userId?: string;
    changes?: Record<string, {
        old: any;
        new: any;
    }>;
    metadata?: Record<string, any>;
    timestamp: Date;
    ipAddress?: string;
}
export declare class AuditTrailManager {
    logAction(action: string, entity: string, entityId: string, options?: {
        userId?: string;
        changes?: Record<string, {
            old: any;
            new: any;
        }>;
        metadata?: Record<string, any>;
        ipAddress?: string;
    }, env?: Env): Promise<boolean>;
    getAuditLogs(filters?: {
        entity?: string;
        entityId?: string;
        userId?: string;
        action?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }, env?: Env): Promise<AuditLogEntry[]>;
    getAuditTrail(entity: string, entityId: string, env?: Env): Promise<AuditLogEntry[]>;
    getUserActivity(userId: string, limit?: number, env?: Env): Promise<AuditLogEntry[]>;
    cleanupOldLogs(daysToKeep?: number, env?: Env): Promise<number>;
    private tableExists;
}
export declare const auditTrailManager: AuditTrailManager;
