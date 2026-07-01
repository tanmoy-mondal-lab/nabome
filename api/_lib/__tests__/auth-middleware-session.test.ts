import { describe, expect, it, vi, beforeEach } from "vitest";
import { authenticate, optionalAuth } from "../auth-middleware";

const mockGetUser = vi.fn();
const mockFindFirst = vi.fn();
const mockSupabase = {
  auth: {
    getUser: mockGetUser,
  },
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock("../prisma", () => ({
  getPrisma: vi.fn(() => ({
    authSession: {
      findFirst: mockFindFirst,
    },
  })),
}));

vi.mock("../token-hash", () => ({
  hashToken: vi.fn(async (token: string) => `hash:${token}`),
}));

describe("auth middleware session enforcement", () => {
  const env = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("allows a request when the local session is active", async () => {
    mockFindFirst.mockResolvedValue({
      profile: { role: "admin" },
    });

    const request = new Request("http://localhost/api/admin/dashboard", {
      headers: { Authorization: "Bearer access-token" },
    });

    const result = await authenticate(request, {}, env);

    expect(result).not.toBeInstanceOf(Response);
    if (!(result instanceof Response)) {
      expect(result.ctx.userId).toBe("user-1");
      expect(result.ctx.userRole).toBe("admin");
    }
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          profileId: "user-1",
          isActive: true,
        }),
      })
    );
  });

  it("rejects a bearer token when the local session has been revoked", async () => {
    mockFindFirst.mockResolvedValue(null);

    const request = new Request("http://localhost/api/orders", {
      headers: { Authorization: "Bearer access-token" },
    });

    const result = await authenticate(request, {}, env);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
    }
  });

  it("keeps legacy raw-token sessions working", async () => {
    mockFindFirst.mockImplementation(async ({ where }) => {
      const tokenMatches = (where.OR as Array<{ accessToken: string }>).some(
        (entry) => entry.accessToken === "legacy-token"
      );
      return tokenMatches ? { profile: { role: "customer" } } : null;
    });

    const request = new Request("http://localhost/api/orders", {
      headers: { Authorization: "Bearer legacy-token" },
    });

    const result = await authenticate(request, {}, env);

    expect(result).not.toBeInstanceOf(Response);
    if (!(result instanceof Response)) {
      expect(result.ctx.userId).toBe("user-1");
      expect(result.ctx.userRole).toBe("customer");
    }
  });

  it("treats revoked tokens as anonymous in optional auth mode", async () => {
    mockFindFirst.mockResolvedValue(null);

    const request = new Request("http://localhost/api/cms/pages/privacy", {
      headers: { Authorization: "Bearer access-token" },
    });

    const result = await optionalAuth(request, env);

    expect(result).toEqual({});
  });
});
