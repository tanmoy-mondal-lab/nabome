import { releaseExpiredReservations } from '../inventory/sweeper.ts';
import { initPrisma } from '../prisma.ts';

export async function handleScheduled(
  event: any,
  env: any,
  ctx: any,
): Promise<void> {
  const hyperdriveCs = (env as any)?.HYPERDRIVE?.connectionString;
  const databaseUrl =
    hyperdriveCs ?? env?.DATABASE_URL ?? process.env.DATABASE_URL ?? '';
  try {
    initPrisma(databaseUrl, { viaHyperdrive: Boolean(hyperdriveCs) });
  } catch {}
  const start = Date.now();
  let result: any = null;
  try {
    result = await releaseExpiredReservations({ batchSize: 100 });
  } catch (e) {
    console.error('[sweeper] failed', e);
    return;
  }
  const durationMs = Date.now() - start;
  console.warn('[sweeper] releaseExpiredReservations', {
    cron: event?.cron ?? '*/5 * * * *',
    processed: result.processed,
    released: result.released,
    skipped: result.skipped,
    failed: result.failed,
    durationMs: result.durationMs ?? durationMs,
    at: new Date().toISOString(),
  });
  if (ctx?.waitUntil) ctx.waitUntil(Promise.resolve());
}

export default { scheduled: handleScheduled };
