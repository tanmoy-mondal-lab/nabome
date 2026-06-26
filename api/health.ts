import type { Env } from "./_lib/env";

export async function GET(_req: Request, opts?: { env?: Env }): Promise<Response> {
  const env = opts?.env;
  const hasDatabaseUrl = !!(env?.DATABASE_URL || env?.DATABASE_URL_POOLED);
  const hasSupabase = !!(env?.SUPABASE_URL || env?.SUPABASE_SERVICE_ROLE_KEY);

  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: hasDatabaseUrl,
      DATABASE_URL_POOLED: !!(env?.DATABASE_URL_POOLED),
      SUPABASE_URL: !!(env?.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: !!(env?.SUPABASE_SERVICE_ROLE_KEY),
      SUPABASE_ANON_KEY: !!(env?.SUPABASE_ANON_KEY),
      RAZORPAY_KEY_ID: !!(env?.RAZORPAY_KEY_ID),
      RESEND_API_KEY: !!(env?.RESEND_API_KEY),
      CLOUDINARY_CLOUD_NAME: !!(env?.CLOUDINARY_CLOUD_NAME),
      EMAIL_FROM: !!(env?.EMAIL_FROM),
      ADMIN_EMAILS: !!(env?.ADMIN_EMAILS),
    },
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
