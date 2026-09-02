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
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(env))
  },
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "POST" && new URL(request.url).pathname === "/run") {
      const result = await handleScheduled(env)
      return Response.json(result)
    }
    return Response.json({ status: "ok", cron: "0 2 * * 1", endpoint: "POST /run" })
  }
}

async function handleScheduled(env: Env): Promise<{ processed: number; created: number; errors: number; timestamp: string }> {
  const start = Date.now()
  let processed = 0, created = 0, errors = 0
  try {
    const mod = await import("../../../apps/api/_lib/finance/service.ts" as any).catch((e) => { throw new Error(`finance service unavailable: ${e?.message}`) })
    const createSettlement = (mod as any).createSettlement
    if (!createSettlement) throw new Error("createSettlement not exported")
    const { getPrisma, initPrisma } = await import("../../../apps/api/_lib/prisma.ts" as any)
    const cs = (env as any).HYPERDRIVE?.connectionString ?? env.DATABASE_URL ?? ""
    if (cs) initPrisma(cs, { viaHyperdrive: Boolean((env as any).HYPERDRIVE?.connectionString) })
    const prisma = getPrisma() as any
    const shops = await prisma.shop.findMany({ where: { isActive: true }, select: { id: true } })
    for (const shop of shops as any[]) {
      processed++
      try {
        await createSettlement(env as any, { shopId: shop.id, actorId: "system-cron" })
        created++
      } catch (e: any) {
        if (e?.code === "SETTLEMENT_MINIMUM_NOT_MET" || e?.code === "DUPLICATE_SETTLEMENT") {
          console.log(`[settlement] skip shop ${shop.id}: ${e.code}`)
        } else {
          console.error(`[settlement] error shop ${shop.id}:`, e?.message)
          errors++
        }
      }
    }
  } catch (e: any) {
    console.error("[settlement] fatal", e?.message)
    errors++
  }
  console.log(`[settlement] done processed=${processed} created=${created} errors=${errors} ${Date.now()-start}ms`)
  return { processed, created, errors, timestamp: new Date().toISOString() }
}
