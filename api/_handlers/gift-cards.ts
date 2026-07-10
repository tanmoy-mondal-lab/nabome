import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError, notFound, created, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
function generateGiftCardCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "GIFT-";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function handleGiftCardRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "validate":
      return handleValidate(req, ctx);
    case "redeem":
      return handleRedeem(req, ctx);
    case "myCards":
      return handleMyCards(req, ctx);
    case "purchase":
      return handlePurchase(req, ctx);
    case "adminList":
      return handleAdminList(ctx);
    case "adminCreate":
      return handleAdminCreate(req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleValidate(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const { code } = await req.json() as { code: string };
    if (!code) return badRequest("Gift card code required");
    const prisma = getPrisma(ctx.env);
    const card = await prisma.gift_cards.findUnique({ where: { code: code.toUpperCase() } });
    if (!card) return notFound("Invalid gift card code");
    if (!card.isActive) return badRequest("Gift card is no longer active");
    if (card.expiresAt && card.expiresAt < new Date()) return badRequest("Gift card has expired");
    if (card.currentBalance.lte(0)) return badRequest("Gift card has no remaining balance");
    return success({ card: { id: card.id, currentBalance: card.currentBalance, currency: card.currency } });
  } catch (e) {
    return serverError(e);
  }
}

async function handleRedeem(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const { code, orderId, amount } = await req.json() as { code: string; orderId: string; amount: number };
    if (!code || !orderId || !amount) return badRequest("Code, order ID, and amount required");
    const prisma = getPrisma(ctx.env);
    const card = await prisma.gift_cards.findUnique({ where: { code: code.toUpperCase() } });
    if (!card) return notFound("Invalid gift card code");
    if (!card.isActive) return badRequest("Gift card is no longer active");
    if (card.currentBalance.lt(amount)) return badRequest("Insufficient gift card balance");
    await prisma.gift_cards.update({
      where: { id: card.id },
      data: { currentBalance: { decrement: amount }, redeemedById: ctx.userId, orderId },
    });
    return success({ redeemed: true, remainingBalance: Number(card.currentBalance) - amount });
  } catch (e) {
    return serverError(e);
  }
}

async function handleMyCards(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    const cards = await prisma.gift_cards.findMany({
      where: { OR: [{ purchasedById: ctx.userId }, { redeemedById: ctx.userId }] },
      orderBy: { createdAt: "desc" },
    });
    return success({ giftCards: cards });
  } catch (e) {
    return serverError(e);
  }
}

async function handlePurchase(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const { amount, recipientName, recipientEmail, senderName, message } = await req.json() as {
      amount: number; recipientName?: string; recipientEmail?: string; senderName?: string; message?: string;
    };
    if (!amount || amount < 100) return badRequest("Minimum gift card amount is 100");
    const prisma = getPrisma(ctx.env);
    const card = await prisma.gift_cards.create({
      data: {
        code: generateGiftCardCode(),
        initialBalance: amount,
        currentBalance: amount,
        senderName: senderName || undefined,
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail || undefined,
        message: message || undefined,
        purchasedById: ctx.userId,
      },
    });
    return created({ giftCard: card });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminList(ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const cards = await prisma.gift_cards.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return success({ giftCards: cards });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminCreate(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const { amount, recipientName, recipientEmail, senderName } = await req.json() as {
      amount: number; recipientName?: string; recipientEmail?: string; senderName?: string;
    };
    if (!amount || amount < 100) return badRequest("Minimum gift card amount is 100");
    const prisma = getPrisma(ctx.env);
    const card = await prisma.gift_cards.create({
      data: {
        code: generateGiftCardCode(),
        initialBalance: amount,
        currentBalance: amount,
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail || undefined,
        senderName: senderName || undefined,
      },
    });
    return created({ giftCard: card });
  } catch (e) {
    return serverError(e);
  }
}
