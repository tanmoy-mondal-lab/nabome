import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, makeContext, makeRequest, parseResponse } from "./test-utils";

vi.mock("../../_lib/prisma", () => ({
  getPrisma: vi.fn(),
}));

import { getPrisma } from "../../_lib/prisma";
import { handleAdminSessionRequest } from "../admin/sessions";
import { handleAdminLoginAttemptRequest } from "../admin/login-attempts";

const mockPrisma = createMockPrisma() as ReturnType<typeof createMockPrisma> & {
  authSession: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  loginAttempt: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
};

mockPrisma.authSession = {
  findMany: vi.fn().mockResolvedValue([]),
  findUnique: vi.fn().mockResolvedValue(null),
  update: vi.fn().mockResolvedValue({}),
  count: vi.fn().mockResolvedValue(0),
};

mockPrisma.loginAttempt = {
  findMany: vi.fn().mockResolvedValue([]),
  count: vi.fn().mockResolvedValue(0),
};

vi.mocked(getPrisma).mockReturnValue(mockPrisma as never);

describe("admin auth activity handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPrisma).mockReturnValue(mockPrisma as never);
  });

  it("lists admin sessions for the activity page", async () => {
    mockPrisma.authSession.findMany.mockResolvedValueOnce([
      {
        id: "session-1",
        profileId: "profile-1",
        userAgent: "Mozilla/5.0",
        ipAddress: "203.0.113.10",
        deviceName: "Windows",
        isActive: true,
        revokedAt: null,
        lastActiveAt: new Date("2026-06-30T10:00:00Z"),
        expiresAt: new Date("2026-07-30T10:00:00Z"),
        createdAt: new Date("2026-06-30T09:00:00Z"),
        profile: {
          id: "profile-1",
          firstName: "Asha",
          lastName: "Khan",
          email: "asha@example.com",
        },
      },
    ]);
    mockPrisma.authSession.count.mockResolvedValueOnce(1);

    const req = makeRequest("GET", "/api/admin/sessions?page=1&limit=15");
    const ctx = makeContext("admin-1");
    ctx.userRole = "admin";

    const res = await handleAdminSessionRequest(req, ctx as any, [], "list");
    const body = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(body.data.sessions).toHaveLength(1);
    expect(body.data.pagination.total).toBe(1);
  });

  it("revokes an admin session", async () => {
    mockPrisma.authSession.findUnique.mockResolvedValueOnce({ id: "session-1" });
    mockPrisma.authSession.update.mockResolvedValueOnce({ id: "session-1" });

    const req = makeRequest("DELETE", "/api/admin/sessions/session-1");
    const ctx = makeContext("admin-1");
    ctx.userRole = "admin";

    const res = await handleAdminSessionRequest(req, ctx as any, ["session-1"], "revoke");
    const body = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(body.data.message).toBe("Session revoked");
    expect(mockPrisma.authSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "session-1" },
        data: expect.objectContaining({ isActive: false, revokedAt: expect.any(Date) }),
      })
    );
  });

  it("lists login attempts with pagination", async () => {
    mockPrisma.loginAttempt.findMany.mockResolvedValueOnce([
      {
        id: "attempt-1",
        email: "user@example.com",
        ipAddress: "203.0.113.1",
        userAgent: "Mozilla/5.0",
        success: false,
        failureReason: "invalid_credentials",
        createdAt: new Date("2026-06-30T10:05:00Z"),
        profile: {
          id: "profile-1",
          firstName: "Asha",
          lastName: "Khan",
          email: "user@example.com",
        },
      },
    ]);
    mockPrisma.loginAttempt.count.mockResolvedValueOnce(1);

    const req = makeRequest("GET", "/api/admin/login-attempts?page=1&limit=25");
    const ctx = makeContext("admin-1");
    ctx.userRole = "admin";

    const res = await handleAdminLoginAttemptRequest(req, ctx as any, [], "list");
    const body = await parseResponse(res);

    expect(res.status).toBe(200);
    expect(body.data.loginAttempts).toHaveLength(1);
    expect(body.data.pagination.total).toBe(1);
  });
});
