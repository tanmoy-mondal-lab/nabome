import type { Env } from "./_lib/env";
import { hasUsableSecret } from "./_lib/secrets";

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export async function GET(req: Request, opts?: { env?: Env }): Promise<Response> {
  const env = opts?.env;
  const url = new URL(req.url);
  const includeChecks = url.searchParams.get("checks") === "1" && isLocalHost(url.hostname);

  const body: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  if (includeChecks) {
    body.checks = {
      database: hasUsableSecret(env?.DATABASE_URL) || hasUsableSecret(env?.DATABASE_URL_POOLED),
      supabase:
        hasUsableSecret(env?.SUPABASE_URL) &&
        hasUsableSecret(env?.SUPABASE_SERVICE_ROLE_KEY) &&
        hasUsableSecret(env?.SUPABASE_ANON_KEY),
      payments:
        hasUsableSecret(env?.RAZORPAY_KEY_ID) &&
        hasUsableSecret(env?.RAZORPAY_KEY_SECRET) &&
        hasUsableSecret(env?.RAZORPAY_WEBHOOK_SECRET),
      email: hasUsableSecret(env?.RESEND_API_KEY) && hasUsableSecret(env?.EMAIL_FROM),
      media: hasUsableSecret(env?.CLOUDINARY_CLOUD_NAME) && hasUsableSecret(env?.CLOUDINARY_UPLOAD_PRESET),
    };
  }

  return Response.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}
