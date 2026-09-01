import { getPrisma } from '../prisma.ts';

import { ReservationStatus } from './repository.ts';

export interface SweepResult {
  processed: number;
  released: number;
  skipped: number;
  failed: number;
  durationMs: number;
}

export async function releaseExpiredReservations(opts?: {
  batchSize?: number;
  now?: Date;
}): Promise<SweepResult> {
  const batchSize = Math.min(Math.max(opts?.batchSize ?? 100, 1), 500);
  const now = opts?.now ?? new Date();
  const prisma = getPrisma() as any;
  const start = Date.now();
  let processed = 0;
  let released = 0;
  let skipped = 0;
  let failed = 0;

  while (true) {
    const expired: any[] = await prisma.stockReservation.findMany({
      where: { status: ReservationStatus.ACTIVE, expiresAt: { lt: now } },
      orderBy: { expiresAt: 'asc' },
      take: batchSize,
      select: { id: true, variantId: true, quantity: true, expiresAt: true },
    });
    if (expired.length === 0) break;
    processed += expired.length;
    for (const r of expired) {
      try {
        const result = await prisma.stockReservation.updateMany({
          where: { id: r.id, status: ReservationStatus.ACTIVE },
          data: {
            status: ReservationStatus.EXPIRED,
            releasedAt: new Date(),
            updatedAt: new Date(),
          },
        });
        if (result.count === 0) {
          skipped++;
          continue;
        }
        released++;
        try {
          const variant = await prisma.productVariant.findUnique({
            where: { id: r.variantId },
            select: { availableStock: true },
          });
          if (variant) {
            await prisma.stockMovement.create({
              data: {
                variantId: r.variantId,
                type: 'release' as any,
                quantity: r.quantity,
                previousStock: variant.availableStock,
                newStock: variant.availableStock,
                referenceId: r.id,
                referenceType: 'reservation_expiry',
              },
            });
          }
        } catch {}
      } catch {
        failed++;
      }
    }
    if (expired.length < batchSize) break;
  }

  const durationMs = Date.now() - start;
  return { processed, released, skipped, failed, durationMs };
}

export const sweeperService = { releaseExpiredReservations };
