import { badRequest } from "./response";
import { cleanSecret } from "./secrets";
import type { RequestContext } from "./types";

type TurnstileResult = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
};

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function getHeader(request: Request, name: string): string {
  return request.headers.get(name) ?? "";
}

export async function extractTurnstileToken(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.clone().json().catch(() => null);
    const token = body && typeof body === "object" ? (body as Record<string, unknown>).turnstileToken : null;
    return typeof token === "string" ? token : "";
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.clone().formData().catch(() => null);
    const token = form?.get("turnstileToken");
    return typeof token === "string" ? token : "";
  }

  return getHeader(request, "cf-turnstile-response");
}

export async function verifyTurnstileToken(
  request: Request,
  ctx: RequestContext
): Promise<Response | null> {
  const secret = cleanSecret(ctx.env?.TURNSTILE_SECRET_KEY);
  if (!secret) {
    return null;
  }

  const token = await extractTurnstileToken(request);
  if (!token) {
    return badRequest("Please complete the verification challenge");
  }

  const ip = getHeader(request, "cf-connecting-ip");

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });

    const result = (await response.json().catch(() => null)) as TurnstileResult | null;

    if (!response.ok || !result?.success) {
      return badRequest("Turnstile verification failed");
    }
  } catch {
    return badRequest("Turnstile verification failed");
  }

  return null;
}
