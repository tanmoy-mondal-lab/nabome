import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError, notFound, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleLoyaltyRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "points":
      return handlePoints(req, ctx);
    case "transactions":
      return handleTransactions(req, ctx);
    case "redeem":
      return handleRedeem(req, ctx);
    case "adminList":
      return handleAdminList(ctx);
    case "adminAdjust":
      return handleAdminAdjust(req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handlePoints(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    let points = await prisma.loyaltyPoints.findUnique({
      where: { profileId: ctx.userId },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!points) {
      points = await prisma.loyaltyPoints.create({
        data: { profileId: ctx.userId, points: 0, tier: "bronze", lifetimePoints: 0 },
        include: { transactions: true },
      });
    }
    const tiers = await prisma.loyaltyTier.findMany({ where: { isActive: true }, orderBy: { minPoints: "asc" } });
    let nextTier: (typeof tiers)[0] | null = null;
    for (const t of tiers) {
      if (t.minPoints > points.points) { nextTier = t; break; }
    }
    return success({ points, tiers, nextTier });
  } catch (e) {
    return serverError(e);
  }
}

async function handleTransactions(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    const points = await prisma.loyaltyPoints.findUnique({ where: { profileId: ctx.userId } });
    if (!points) return success({ transactions: [] });
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { loyaltyPointsId: points.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return success({ transactions });
  } catch (e) {
    return serverError(e);
  }
}

async function handleRedeem(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const { points } = await req.json() as { points: number };
    if (!points || points < 100) return badRequest("Minimum 100 points required for redemption");
    const prisma = getPrisma(ctx.env);
    const lp = await prisma.loyaltyPoints.findUnique({ where: { profileId: ctx.userId } });
    if (!lp || lp.points < points) return badRequest("Insufficient points");
    await prisma.$transaction(async (tx) => {
      await tx.loyaltyPoints.update({ where: { id: lp.id }, data: { points: { decrement: points } } });
      await tx.loyaltyTransaction.create({
        data: { loyaltyPointsId: lp.id, points: -points, type: "redeemed", description: `Redeemed ${points} points` },
      });
    });
    return success({ redeemed: true, points });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminList(ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const all = await prisma.loyaltyPoints.findMany({
      include: { profile: { select: { id: true, email: true, firstName: true } } },
      orderBy: { points: "desc" },
    });
    return success({ loyaltyAccounts: all });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminAdjust(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const { profileId, points, reason } = await req.json() as { profileId: string; points: number; reason: string };
    if (!profileId || !points) return badRequest("Profile ID and points required");
    const prisma = getPrisma(ctx.env);
    let lp = await prisma.loyaltyPoints.findUnique({ where: { profileId } });
    if (!lp) {
      lp = await prisma.loyaltyPoints.create({ data: { profileId, points: 0, tier: "bronze", lifetimePoints: 0 } });
    }
    await prisma.$transaction(async (tx) => {
      await tx.loyaltyPoints.update({ where: { id: lp!.id }, data: { points: { increment: points } } });
      await tx.loyaltyTransaction.create({
        data: { loyaltyPointsId: lp!.id, points, type: "adjusted", description: reason || "Admin adjustment" },
      });
    });
    return success({ adjusted: true });
  } catch (e) {
    return serverError(e);
  }
}
