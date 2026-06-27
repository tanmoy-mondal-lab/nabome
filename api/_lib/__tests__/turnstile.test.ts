import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "../turnstile";

describe("Turnstile verification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("skips verification when the secret is not configured", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ turnstileToken: "token-123" }),
    });

    const result = await verifyTurnstileToken(request, { env: {} });

    expect(result).toBeNull();
  });

  it("rejects requests that do not include a token", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const result = await verifyTurnstileToken(request, {
      env: { TURNSTILE_SECRET_KEY: "secret" },
    });

    expect(result).not.toBeNull();
    expect(result!.status).toBe(400);
    const body = await result!.json();
    expect(body.error.message).toBe("Please complete the verification challenge");
  });

  it("posts the token to Cloudflare siteverify and allows valid responses", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const payload = JSON.parse(String(init?.body));
      expect(payload.secret).toBe("secret");
      expect(payload.response).toBe("token-123");
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    vi.stubGlobal("fetch", fetchMock as typeof fetch);

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "1.2.3.4" },
      body: JSON.stringify({ turnstileToken: "token-123" }),
    });

    const result = await verifyTurnstileToken(request, {
      env: { TURNSTILE_SECRET_KEY: "secret" },
    });

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects failed siteverify responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ success: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch
    );

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ turnstileToken: "token-123" }),
    });

    const result = await verifyTurnstileToken(request, {
      env: { TURNSTILE_SECRET_KEY: "secret" },
    });

    expect(result).not.toBeNull();
    expect(result!.status).toBe(400);
  });
});
