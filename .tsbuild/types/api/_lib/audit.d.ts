import type { Env } from "./env";
export interface AuditLogOptions {
    entity?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string | null;
    userAgent?: string | null;
}
export declare function logAction(profileId: string | undefined | null, action: string, opts?: AuditLogOptions, env?: Env): Promise<void>;
export declare function extractRequestMeta(req: Request): {
    ipAddress: string | null;
    userAgent: string | null;
};
