import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockQueryRaw = vi.fn();
const mockListUsers = vi.fn();

vi.mock("../../_lib/prisma", () => ({
  getPrisma: vi.fn(() => ({
    $queryRaw: mockQueryRaw,
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        listUsers: mockListUsers,
      },
    },
  })),
}));

import { GET } from "../../health";

describe("health endpoint probes", () => {
  const env = {
    CF_PAGES: "true",
    DATABASE_URL: "postgres://example",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    RAZORPAY_KEY_ID: "rzp_key",
    RAZORPAY_KEY_SECRET: "rzp_secret",
    RAZORPAY_WEBHOOK_SECRET: "wh_secret",
    RESEND_API_KEY: "resend_key",
    EMAIL_FROM: "noreply@example.com",
    ADMIN_EMAILS: "admin@example.com",
    CLOUDINARY_CLOUD_NAME: "nabome",
    CLOUDINARY_API_KEY: "cloud-key",
    CLOUDINARY_API_SECRET: "cloud-secret",
    CLOUDINARY_UPLOAD_PRESET: "preset",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryRaw.mockResolvedValue([{ 1: 1 }]);
    mockListUsers.mockResolvedValue({ error: null, data: { users: [] } });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("api.razorpay.com")) {
        return new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("api.resend.com/domains")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("api.cloudinary.com")) {
        return new Response(JSON.stringify({ resources: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch call: ${url}`);
    }) as unknown as typeof fetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports ok when all probes succeed", async () => {
    const res = await GET(new Request("http://localhost:8788/api/health?checks=1"), { env });
    const body = await res.json() as Record<string, any>;

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.database.status).toBe("ok");
    expect(body.checks.supabase.status).toBe("ok");
    expect(body.checks.payments.status).toBe("ok");
    expect(body.checks.email.status).toBe("ok");
    expect(body.checks.media.status).toBe("ok");
  });

  it("returns degraded readiness when required config is missing", async () => {
    const res = await GET(new Request("http://localhost:8788/api/health?checks=1"), {
      env: {
        CF_PAGES: "true",
        DATABASE_URL: "postgres://example",
      } as never,
    });
    const body = await res.json() as Record<string, any>;

    expect(res.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.supabase.configured).toBe(false);
    expect(body.checks.payments.configured).toBe(false);
    expect(body.checks.email.configured).toBe(false);
    expect(body.checks.media.configured).toBe(false);
  });
});
