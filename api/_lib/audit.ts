import { getPrisma } from "./prisma";
import type { Env } from "./env";
import type { Prisma } from "@prisma/client";

export interface AuditLogOptions {
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAction(
  profileId: string | undefined | null,
  action: string,
  opts: AuditLogOptions = {},
  env?: Env
): Promise<void> {
  try {
    const prisma = getPrisma(env);
    await prisma.user_action_logs.create({
      data: {
        profileId: profileId ?? null,
        action,
        entity: opts.entity ?? null,
        entityId: opts.entityId ?? null,
        metadata: (opts.metadata ?? null) as Prisma.InputJsonValue,
        ipAddress: opts.ipAddress ?? null,
        userAgent: opts.userAgent ?? null,
      },
    });
  } catch {
    // Non-critical — don't block the action
  }
}

export function extractRequestMeta(req: Request): { ipAddress: string | null; userAgent: string | null } {
  return {
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || req.headers.get("x-real-ip")
      || null,
    userAgent: req.headers.get("user-agent") ?? null,
  };
}
