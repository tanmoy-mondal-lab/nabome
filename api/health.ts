import type { Env } from "./_lib/env";
import { hasUsableSecret, cleanSecret } from "./_lib/secrets";
import { getPrisma } from "./_lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { healthMonitor } from "./_lib/health-monitor";
import { getJobQueueStats } from "./_lib/job-queue";
import { setCsrfCookie } from "./_lib/csrf";

interface ProbeResult {
  configured: boolean;
  reachable: boolean;
  status: "ok" | "degraded";
  message?: string;
  metrics?: Record<string, unknown>;
}

interface HealthChecks {
  database: ProbeResult;
  supabase: ProbeResult;
  payments: ProbeResult;
  email: ProbeResult;
  media: ProbeResult;
  worker?: ProbeResult;
  queue?: ProbeResult;
}

function isLocalHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function runtimeAllowsChecks(url: URL, env?: Env): boolean {
  return isLocalHost(url.hostname) || env?.CF_PAGES === "1" || env?.CF_PAGES === "true";
}

function toBase64(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }
  return btoa(value);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} probe timed out`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function readyState(configured: boolean, reachable: boolean, message?: string): ProbeResult {
  const status = configured && reachable ? "ok" : "degraded";
  return { configured, reachable, status, ...(message ? { message } : {}) };
}

async function probeDatabase(env?: Env): Promise<ProbeResult> {
  const configured = hasUsableSecret(env?.DATABASE_URL) || hasUsableSecret(env?.DATABASE_URL_POOLED);
  if (!configured) {
    return readyState(false, false, "DATABASE_URL or DATABASE_URL_POOLED is missing");
  }

  try {
    await withTimeout(getPrisma(env).$queryRaw`SELECT 1`, 5000, "Database");
    return readyState(true, true);
  } catch (error) {
    return readyState(true, false, error instanceof Error ? error.message : "Database probe failed");
  }
}

async function probeSupabase(env?: Env): Promise<ProbeResult> {
  const url = cleanSecret(env?.SUPABASE_URL) || cleanSecret(env?.VITE_SUPABASE_URL);
  const key = cleanSecret(env?.SUPABASE_SERVICE_ROLE_KEY);
  const anonKey = cleanSecret(env?.SUPABASE_ANON_KEY) || cleanSecret(env?.VITE_SUPABASE_ANON_KEY);
  const configured = Boolean(url && key && anonKey);
  if (!configured) {
    return readyState(false, false, "Supabase URL, anon key, or service role key is missing");
  }

  try {
    const client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await withTimeout(
      client.auth.admin.listUsers({ page: 1, perPage: 1 }),
      4000,
      "Supabase"
    );
    if (error) {
      return readyState(true, false, error.message);
    }
    return readyState(true, true);
  } catch (error) {
    return readyState(true, false, error instanceof Error ? error.message : "Supabase probe failed");
  }
}

async function probePayments(env?: Env): Promise<ProbeResult> {
  const keyId = cleanSecret(env?.RAZORPAY_KEY_ID);
  const keySecret = cleanSecret(env?.RAZORPAY_KEY_SECRET);
  const webhookSecret = cleanSecret(env?.RAZORPAY_WEBHOOK_SECRET);
  const configured = Boolean(keyId && keySecret && webhookSecret);
  if (!configured) {
    return readyState(false, false, "Razorpay key, secret, or webhook secret is missing");
  }

  try {
    const response = await withTimeout(
      fetch("https://api.razorpay.com/v1/orders?count=1", {
        method: "GET",
        headers: {
          Authorization: `Basic ${toBase64(`${keyId}:${keySecret}`)}`,
        },
      }),
      4000,
      "Razorpay"
    );
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return readyState(true, false, body || `HTTP ${response.status}`);
    }
    return readyState(true, true);
  } catch (error) {
    return readyState(true, false, error instanceof Error ? error.message : "Razorpay probe failed");
  }
}

async function probeEmail(env?: Env): Promise<ProbeResult> {
  const apiKey = cleanSecret(env?.RESEND_API_KEY);
  const from = cleanSecret(env?.EMAIL_FROM);
  const adminEmails = cleanSecret(env?.ADMIN_EMAILS);
  const configured = Boolean(apiKey && from && adminEmails);
  if (!configured) {
    return readyState(false, false, "Resend API key, sender address, or admin recipients are missing");
  }

  // Resend API keys can be restricted to sending-only, which rejects listing endpoints.
  // Validate by pinging a lightweight key-check endpoint instead.
  try {
    const response = await withTimeout(
      fetch("https://api.resend.com/audience", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }),
      4000,
      "Resend"
    );
    if (response.status === 401 || response.status === 403) {
      const body = await response.json().catch(() => ({}));
      const errMsg = body?.message ?? "";
      // Restricted sending-only keys return 401/403 on listing endpoints — that's fine.
      if (errMsg.includes("restricted") || errMsg.includes("sending")) {
        return readyState(true, true);
      }
      return readyState(true, false, errMsg || `HTTP ${response.status}`);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return readyState(true, false, body || `HTTP ${response.status}`);
    }
    return readyState(true, true);
  } catch (error) {
    return readyState(true, false, error instanceof Error ? error.message : "Resend probe failed");
  }
}

async function probeMedia(env?: Env): Promise<ProbeResult> {
  const cloudName = cleanSecret(env?.CLOUDINARY_CLOUD_NAME);
  const apiKey = cleanSecret(env?.CLOUDINARY_API_KEY);
  const apiSecret = cleanSecret(env?.CLOUDINARY_API_SECRET);
  const uploadPreset = cleanSecret(env?.CLOUDINARY_UPLOAD_PRESET);
  const configured = Boolean(cloudName && apiKey && apiSecret && uploadPreset);
  if (!configured) {
    return readyState(false, false, "Cloudinary credentials or upload preset are missing");
  }

  try {
    const response = await withTimeout(
      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?max_results=1`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${toBase64(`${apiKey}:${apiSecret}`)}`,
        },
      }),
      4000,
      "Cloudinary"
    );
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return readyState(true, false, body || `HTTP ${response.status}`);
    }
    return readyState(true, true);
  } catch (error) {
    return readyState(true, false, error instanceof Error ? error.message : "Cloudinary probe failed");
  }
}

async function probeWorker(_env?: Env): Promise<ProbeResult> {
  // Cloudflare Pages Functions are serverless - check if runtime is available
  const configured = true; // Always configured in Cloudflare Pages
  const metrics = healthMonitor.getMetrics();
  
  return {
    configured,
    reachable: true,
    status: "ok",
    metrics: {
      uptime: metrics.uptime,
      requests: metrics.requestCount,
      errorRate: metrics.errorRate,
      avgResponseTime: metrics.averageResponseTime,
    },
  };
}

async function probeQueue(env?: Env): Promise<ProbeResult> {
  const configured = true; // Database-backed queue is always configured
  try {
    if (!env) {
      return readyState(true, false, "Environment not available");
    }
    const stats = await getJobQueueStats(env);
    return {
      configured,
      reachable: true,
      status: "ok",
      metrics: stats,
    };
  } catch (error) {
    return readyState(true, false, error instanceof Error ? error.message : "Queue probe failed");
  }
}

export async function GET(req: Request, opts?: { env?: Env }): Promise<Response> {
  const env = opts?.env;
  const url = new URL(req.url);
  const includeChecks = url.searchParams.get("checks") === "1" && runtimeAllowsChecks(url, env);

  const body: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  if (includeChecks) {
    const [database, supabase, payments, email, media, worker, queue] = await Promise.all([
      probeDatabase(env),
      probeSupabase(env),
      probePayments(env),
      probeEmail(env),
      probeMedia(env),
      probeWorker(env),
      probeQueue(env),
    ]);

    const checks: HealthChecks = {
      database,
      supabase,
      payments,
      email,
      media,
      worker,
      queue,
    };

    const overallReady = Object.values(checks).every((check) => check.status === "ok");
    body.status = overallReady ? "ok" : "degraded";
    body.checks = checks;
  }

  // Add health monitor metrics
  const metrics = healthMonitor.getMetrics();
  body.metrics = metrics;

  const shouldFailClosed = includeChecks && (env?.CF_PAGES === "1" || env?.CF_PAGES === "true");

  const response = Response.json(body, {
    status: shouldFailClosed && body.status === "degraded" ? 503 : 200,
    headers: { "Cache-Control": "no-store" },
  });

  // Security: Set CSRF cookie on health check for initial token establishment
  return setCsrfCookie(response, env);
}
