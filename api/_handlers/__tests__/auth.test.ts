import { describe, expect, it, vi, beforeEach } from "vitest";

// ─── Mock external dependencies ───
vi.mock("../../_lib/prisma", () => ({ getPrisma: vi.fn() }));
vi.mock("../../_lib/email", () => ({ sendEmailNotification: vi.fn() }));
vi.mock("../../_lib/audit", () => ({
  logAction: vi.fn().mockResolvedValue(undefined),
  extractRequestMeta: vi.fn().mockReturnValue({}),
}));
vi.mock("../../_lib/env", () => ({
  getEnv: () => ({
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    VITE_SUPABASE_URL: "https://example.supabase.co",
    VITE_SUPABASE_ANON_KEY: "anon-key",
  }),
  Env: class {},
}));
vi.mock("../../_lib/token-hash", () => ({ hashToken: (t: string) => Promise.resolve(`hash:${t}`) }));
vi.mock("../../_lib/rate-limit", () => ({
  withRateLimit: vi.fn().mockResolvedValue(null),
  RATE_LIMIT_CONFIG: { resendVerification: { windowMs: 3600000, maxRequests: 3 } },
}));
vi.mock("../../_lib/cookies", () => ({
  setCookie: vi.fn(),
  clearCookie: vi.fn(),
  parseCookies: vi.fn(() => ({})),
  COOKIE_CONFIG: {
    ACCESS_TOKEN: { name: "access_token" },
    REFRESH_TOKEN: { name: "refresh_token" },
    CSRF_TOKEN: { name: "csrf_token" },
  },
}));

const mockSupabase = {
  auth: {
    admin: {
      createUser: vi.fn(),
      deleteUser: vi.fn().mockResolvedValue({}),
      listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
      updateUserById: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({}),
    },
    signInWithPassword: vi.fn(),
    refreshSession: vi.fn(),
  },
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

import { getPrisma } from "../../_lib/prisma";
import { sendEmailNotification } from "../../_lib/email";
import { handleAuthRequest } from "../auth";

const mockPrisma = {
  profiles: {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
  login_attempts: {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue({}),
  },
  verification_attempts: {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
  },
  auth_sessions: {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({}),
  },
};

vi.mocked(getPrisma).mockReturnValue(mockPrisma as never);

function makeRequest(action: string, body: unknown): Request {
  return new Request(`http://localhost/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const ctx = {
  env: {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    VITE_SUPABASE_URL: "https://example.supabase.co",
    VITE_SUPABASE_ANON_KEY: "anon-key",
  },
};

async function call(action: string, body: unknown) {
  const res = await handleAuthRequest(makeRequest(action, body), ctx as never, [], action);
  const json = await res.json();
  return { status: res.status, json };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPrisma).mockReturnValue(mockPrisma as never);
  mockPrisma.profiles.findUnique.mockResolvedValue(null);
  mockPrisma.profiles.findFirst.mockResolvedValue(null);
  mockPrisma.login_attempts.findMany.mockResolvedValue([]);
  mockPrisma.verification_attempts.findMany.mockResolvedValue([]);
  mockSupabase.auth.admin.createUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error: { message: "invalid" } });
  vi.mocked(sendEmailNotification).mockResolvedValue({ success: true, error: null });
});

describe("Registration", () => {
  it("creates a new account and sends a verification email", async () => {
    const { status, json } = await call("register", {
      email: "new@example.com",
      password: "Passw0rd!",
      firstName: "New",
    });
    expect(status).toBe(201);
    expect(json.data.message).toContain("A verification email has been sent");
    expect(sendEmailNotification).toHaveBeenCalled();
  });

  it("blocks an already-verified existing account", async () => {
    mockPrisma.profiles.findUnique.mockResolvedValue({ id: "u1", emailVerified: true, firstName: "A" });
    const { status, json } = await call("register", {
      email: "existing@example.com",
      password: "Passw0rd!",
      firstName: "A",
    });
    expect(status).toBe(409);
    expect(json.error.message).toContain("An account with this email already exists. Please log in.");
  });

  it("resends verification for an existing unverified account without blocking", async () => {
    mockPrisma.profiles.findUnique.mockResolvedValue({ id: "u1", emailVerified: false, firstName: "A" });
    const { status, json } = await call("register", {
      email: "unverified@example.com",
      password: "Passw0rd!",
      firstName: "A",
    });
    expect(status).toBe(200);
    expect(json.data.message).toContain("We have sent you a new verification email");
    expect(json.data.accountExists).toBe(true);
    expect(mockPrisma.profiles.update).toHaveBeenCalled();
  });

  it("recovers an orphaned Supabase user (auth user exists, no profile)", async () => {
    mockSupabase.auth.admin.listUsers.mockResolvedValue({
      data: { users: [{ id: "orphan-id", email: "orphan@example.com" }] },
      error: null,
    });
    const { status, json } = await call("register", {
      email: "orphan@example.com",
      password: "Passw0rd!",
      firstName: "Orphan",
    });
    expect(status).toBe(201);
    expect(json.data.message).toContain("A verification email has been sent");
    expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalledWith(
      "orphan-id",
      expect.objectContaining({ password: "Passw0rd!" })
    );
    expect(mockPrisma.profiles.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: "orphan-id", email: "orphan@example.com" }),
      })
    );
  });

  it("converts a guest profile into a full account without breaking links", async () => {
    mockPrisma.profiles.findUnique.mockResolvedValue({
      id: "guest-id", emailVerified: true, firstName: "G", preferences: { guest: true },
    });
    const { status, json } = await call("register", {
      email: "guest@example.com",
      password: "Passw0rd!",
      firstName: "G",
    });
    expect(status).toBe(201);
    expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: "guest-id" })
    );
    expect(mockPrisma.profiles.update).toHaveBeenCalled();
    expect(json.data.message).toContain("A verification email has been sent");
  });
});

describe("Login", () => {
  it("reports when no account exists", async () => {
    mockPrisma.profiles.findUnique.mockResolvedValue(null);
    const { status, json } = await call("login", { email: "nope@example.com", password: "Passw0rd!" });
    expect(status).toBe(401);
    expect(json.error.message).toBe("No account found with this email.");
  });

  it("reports an incorrect password", async () => {
    mockPrisma.profiles.findUnique.mockResolvedValue({ id: "u1", emailVerified: true, firstName: "A" });
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { session: null }, error: { message: "invalid" } });
    const { status, json } = await call("login", { email: "a@b.com", password: "wrong" });
    expect(status).toBe(401);
    expect(json.error.message).toBe("Incorrect password.");
  });

  it("sends a fresh verification email for an unverified account", async () => {
    mockPrisma.profiles.findUnique.mockResolvedValue({ id: "u1", emailVerified: false, firstName: "A" });
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: "at", refresh_token: "rt", expires_in: 3600 }, user: { id: "u1" } },
      error: null,
    });
    const { status, json } = await call("login", { email: "un@b.com", password: "Passw0rd!" });
    expect(status).toBe(401);
    expect(json.error.message).toContain("Your email has not been verified");
    expect(json.error.message).toContain("We've sent you a new verification email");
    expect(json.details.needsVerification).toBe(true);
    expect(sendEmailNotification).toHaveBeenCalled();
  });

  it("reports inability to send verification email on unverified login", async () => {
    mockPrisma.profiles.findUnique.mockResolvedValue({ id: "u1", emailVerified: false, firstName: "A" });
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: "at", refresh_token: "rt", expires_in: 3600 }, user: { id: "u1" } },
      error: null,
    });
    vi.mocked(sendEmailNotification).mockResolvedValue({ success: false, error: "fail" });
    const { status, json } = await call("login", { email: "un@b.com", password: "Passw0rd!" });
    expect(status).toBe(401);
    expect(json.error.message).toBe("We couldn't send the verification email. Please try again.");
  });
});

describe("Email verification", () => {
  const future = new Date(Date.now() + 60 * 60 * 1000);
  const past = new Date(Date.now() - 60 * 60 * 1000);

  it("verifies a valid code", async () => {
    mockPrisma.profiles.findFirst.mockResolvedValue({
      id: "u1", email: "a@b.com", firstName: "A", emailVerified: false, verificationTokenExpiresAt: future,
    });
    const { status, json } = await call("verifyEmail", { email: "a@b.com", code: "123456" });
    expect(status).toBe(200);
    expect(json.data.message).toContain("Your email has been verified successfully");
    expect(mockPrisma.profiles.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ emailVerified: true }) })
    );
  });

  it("reports an already-verified account", async () => {
    mockPrisma.profiles.findFirst.mockResolvedValue({
      id: "u1", email: "a@b.com", firstName: "A", emailVerified: true, verificationTokenExpiresAt: future,
    });
    const { status, json } = await call("verifyEmail", { email: "a@b.com", code: "123456" });
    expect(status).toBe(200);
    expect(json.data.message).toContain("Your email has already been verified");
  });

  it("auto-resends a new email when the code expired", async () => {
    mockPrisma.profiles.findFirst.mockResolvedValue({
      id: "u1", email: "a@b.com", firstName: "A", emailVerified: false, verificationTokenExpiresAt: past,
    });
    const { status, json } = await call("verifyEmail", { email: "a@b.com", code: "123456" });
    expect(status).toBe(400);
    expect(json.error.message).toContain("Your verification code has expired");
    expect(json.error.message).toContain("We've sent you a new verification email");
    expect(sendEmailNotification).toHaveBeenCalled();
  });

  it("rejects an invalid code", async () => {
    mockPrisma.profiles.findFirst.mockResolvedValue(null);
    const { status, json } = await call("verifyEmail", { email: "a@b.com", code: "000000" });
    expect(status).toBe(400);
    expect(json.error.message).toBe("Invalid verification code");
  });
});

describe("Resend verification", () => {
  it("sends a new verification email for an unverified account", async () => {
    mockPrisma.profiles.findUnique.mockResolvedValue({
      id: "u1", email: "a@b.com", firstName: "A", emailVerified: false,
    });
    const { status, json } = await call("resendVerification", { email: "a@b.com" });
    expect(status).toBe(200);
    expect(json.data.message).toBe("We've sent you a new verification email.");
    expect(mockPrisma.profiles.update).toHaveBeenCalled();
  });
});
