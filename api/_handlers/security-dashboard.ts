// ─────────────────────────────────────────────────────────────
// SECURITY DASHBOARD — Backend API for security monitoring
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { requireAdmin } from "../_lib/auth-middleware";
import type { PrismaClient } from "@prisma/client";

export async function handleSecurityDashboardRequest(
  _req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  const prisma = getPrisma(ctx.env!);

  switch (action) {
    case "overview":
      return handleOverview(prisma);
    case "auth-events":
      return handleAuthEvents(prisma);
    case "failed-logins":
      return handleFailedLogins(prisma);
    case "suspicious-activity":
      return handleSuspiciousActivity(prisma);
    case "permission-denials":
      return handlePermissionDenials(prisma);
    case "active-sessions":
      return handleActiveSessions(prisma);
    case "rate-limit-violations":
      return handleRateLimitViolations(prisma);
    case "security-score":
      return handleSecurityScore(prisma);
    default:
      return badRequest("Unknown security dashboard action");
  }
}

async function handleOverview(prisma: PrismaClient): Promise<Response> {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get metrics
    const [
      totalUsers,
      activeUsers,
      totalSessions,
      activeSessions,
      failedLogins24h,
      failedLogins7d,
      permissionDenials24h,
      suspiciousActivity24h,
    ] = await Promise.all([
      prisma.profiles.count(),
      prisma.profiles.count({ where: { emailVerified: true } }),
      prisma.auth_sessions.count(),
      prisma.auth_sessions.count({ where: { isActive: true, expiresAt: { gt: now } } }),
      prisma.user_action_logs.count({
        where: {
          action: "auth:login_failed",
          createdAt: { gte: yesterday },
        },
      }),
      prisma.user_action_logs.count({
        where: {
          action: "auth:login_failed",
          createdAt: { gte: lastWeek },
        },
      }),
      prisma.user_action_logs.count({
        where: {
          action: { startsWith: "permission:permission_denied" },
          createdAt: { gte: yesterday },
        },
      }),
      prisma.user_action_logs.count({
        where: {
          action: { startsWith: "security:" },
          severity: "warning",
          createdAt: { gte: yesterday },
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      }),
    ]);

    return success({
      users: {
        total: totalUsers,
        active: activeUsers,
        activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
      },
      sessions: {
        total: totalSessions,
        active: activeSessions,
        activeRate: totalSessions > 0 ? ((activeSessions / totalSessions) * 100).toFixed(1) : 0,
      },
      security: {
        failedLogins24h,
        failedLogins7d,
        permissionDenials24h,
        suspiciousActivity24h,
      },
      timestamp: now.toISOString(),
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAuthEvents(prisma: PrismaClient): Promise<Response> {
  try {
    const events = await prisma.user_action_logs.findMany({
      where: {
        action: { startsWith: "auth:" },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        action: true,
        profileId: true,
        entity: true,
        entityId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        severity: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    return success({ events });
  } catch (err) {
    return serverError(err);
  }
}

async function handleFailedLogins(prisma: PrismaClient): Promise<Response> {
  try {
    const failedLogins = await prisma.user_action_logs.findMany({
      where: {
        action: "auth:login_failed",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        profileId: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Group by IP to identify potential attackers
    const ipGroups = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    failedLogins.forEach((login: any) => {
      if (login.ipAddress) {
        ipGroups.set(login.ipAddress, (ipGroups.get(login.ipAddress) || 0) + 1);
      }
    });

    const suspiciousIPs = Array.from(ipGroups.entries())
      .filter(([, count]) => count >= 5)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count);

    return success({
      failedLogins,
      suspiciousIPs,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleSuspiciousActivity(prisma: PrismaClient): Promise<Response> {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const events = await prisma.user_action_logs.findMany({
      where: {
        action: { startsWith: "security:" },
        createdAt: { gte: last24h },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        action: true,
        profileId: true,
        entity: true,
        entityId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        severity: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    return success({ events });
  } catch (err) {
    return serverError(err);
  }
}

async function handlePermissionDenials(prisma: PrismaClient): Promise<Response> {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const events = await prisma.user_action_logs.findMany({
      where: {
        action: "permission:permission_denied",
        createdAt: { gte: last24h },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        profileId: true,
        entity: true,
        entityId: true,
        metadata: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    // Group by permission to identify commonly denied permissions
    const permissionGroups = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events.forEach((event: any) => {
      const permission = event.metadata?.permission;
      if (permission) {
        permissionGroups.set(permission, (permissionGroups.get(permission) || 0) + 1);
      }
    });

    const commonDenials = Array.from(permissionGroups.entries())
      .map(([permission, count]) => ({ permission, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return success({
      events,
      commonDenials,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleActiveSessions(prisma: PrismaClient): Promise<Response> {
  try {
    const now = new Date();

    const sessions = await prisma.auth_sessions.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: now },
      },
      orderBy: { lastActiveAt: "desc" },
      take: 50,
      select: {
        id: true,
        profileId: true,
        createdAt: true,
        expiresAt: true,
        lastActiveAt: true,
        ipAddress: true,
        userAgent: true,
        profile: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    return success({ sessions });
  } catch (err) {
    return serverError(err);
  }
}

async function handleRateLimitViolations(prisma: PrismaClient): Promise<Response> {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const events = await prisma.user_action_logs.findMany({
      where: {
        action: "security:rate_limit_exceeded",
        createdAt: { gte: last24h },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        profileId: true,
        ipAddress: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Group by IP to identify rate limit abusers
    const ipGroups = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events.forEach((event: any) => {
      if (event.ipAddress) {
        ipGroups.set(event.ipAddress, (ipGroups.get(event.ipAddress) || 0) + 1);
      }
    });

    const abusiveIPs = Array.from(ipGroups.entries())
      .filter(([, count]) => count >= 10)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count);

    return success({
      events,
      abusiveIPs,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleSecurityScore(prisma: PrismaClient): Promise<Response> {
  try {
    const now = new Date();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate security score based on various factors
    const [
      failedLogins7d,
      suspiciousEvents7d,
      permissionDenials7d,
      rateLimitViolations7d,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      prisma.user_action_logs.count({
        where: {
          action: "auth:login_failed",
          createdAt: { gte: last7d },
        },
      }),
      prisma.user_action_logs.count({
        where: {
          action: { startsWith: "security:" },
          severity: "warning",
          createdAt: { gte: last7d },
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      }),
      prisma.user_action_logs.count({
        where: {
          action: "permission:permission_denied",
          createdAt: { gte: last7d },
        },
      }),
      prisma.user_action_logs.count({
        where: {
          action: "security:rate_limit_exceeded",
          createdAt: { gte: last7d },
        },
      }),
      prisma.profiles.count(),
      prisma.profiles.count({ where: { emailVerified: true } }),
    ]);

    // Calculate score (0-100)
    let score = 100;
    const issues: string[] = [];

    // Deduct points for failed logins
    if (failedLogins7d > 100) {
      score -= 20;
      issues.push("High number of failed login attempts");
    } else if (failedLogins7d > 50) {
      score -= 10;
      issues.push("Elevated failed login attempts");
    }

    // Deduct points for suspicious events
    if (suspiciousEvents7d > 50) {
      score -= 15;
      issues.push("High number of suspicious security events");
    } else if (suspiciousEvents7d > 20) {
      score -= 5;
      issues.push("Some suspicious security events detected");
    }

    // Deduct points for permission denials
    if (permissionDenials7d > 100) {
      score -= 10;
      issues.push("High number of permission denials");
    } else if (permissionDenials7d > 50) {
      score -= 5;
      issues.push("Elevated permission denials");
    }

    // Deduct points for rate limit violations
    if (rateLimitViolations7d > 50) {
      score -= 15;
      issues.push("High number of rate limit violations");
    } else if (rateLimitViolations7d > 20) {
      score -= 5;
      issues.push("Some rate limit violations detected");
    }

    // Add points for good practices
    if (totalUsers > 0) {
      const verificationRate = (activeUsers / totalUsers) * 100;
      if (verificationRate > 90) {
        score += 5;
      } else if (verificationRate > 80) {
        score += 3;
      }
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    const riskLevel = score >= 80 ? "low" : score >= 60 ? "medium" : "high";

    return success({
      score,
      riskLevel,
      issues,
      metrics: {
        failedLogins7d,
        suspiciousEvents7d,
        permissionDenials7d,
        rateLimitViolations7d,
        userVerificationRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
      },
      timestamp: now.toISOString(),
    });
  } catch (err) {
    return serverError(err);
  }
}
