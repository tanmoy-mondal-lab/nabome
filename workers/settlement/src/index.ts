export interface Env {
  ENVIRONMENT: string
  HYPERDRIVE: Hyperdrive
  KV: KVNamespace
  DATABASE_URL?: string
  JWT_SECRET?: string
  LOG_LEVEL?: string
  FINANCE_COMMISSION_RATE?: string
  FINANCE_COMMISSION_CAP?: string
  FINANCE_HOLD_DAYS?: string
  FINANCE_SETTLEMENT_MIN?: string
  SETTLEMENT_CRON_SECRET?: string
  SETTLEMENT_API_URL?: string
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(env))
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === "POST" && url.pathname === "/run") {
      const result = await handleScheduled(env)
      const isError = result.errors > 0 && result.created === 0 && result.processed === 0
      return Response.json(result, { status: isError ? 500 : 200 })
    }
    return Response.json({ status: "ok", cron: "0 2 * * 1", endpoint: "POST /run" })
  }
}

async function handleScheduled(env: Env): Promise<{ processed: number; created: number; errors: number; timestamp: string; detail?: any }> {
  const start = Date.now()
  const apiUrl = env.SETTLEMENT_API_URL ?? "https://nabome-api.pages.dev"
  const secret = env.SETTLEMENT_CRON_SECRET
  if (!secret) throw new Error("SETTLEMENT_CRON_SECRET not configured")
  const res = await fetch(`${apiUrl}/api/v1/internal/settlement/run`, {
    method: "POST",
    headers: { "x-settlement-secret": secret, "content-type": "application/json" },
    body: JSON.stringify({ actorId: "system-cron" })
  })
  const body = await res.json().catch(() => ({})) as any
  if (!res.ok) {
    console.error("[settlement] API error", res.status, body)
    throw new Error(`settlement API failed: ${res.status} ${JSON.stringify(body).slice(0,500)}`)
  }
  console.log(`[settlement] API result ${JSON.stringify(body)} ${Date.now()-start}ms`)
  return { processed: body.data?.processed ?? 0, created: body.data?.created ?? 0, errors: body.data?.errors ?? 0, timestamp: new Date().toISOString(), detail: body.data }
}
