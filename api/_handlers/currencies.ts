import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError, notFound } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleCurrencyRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList(ctx);
    case "convert":
      return handleConvert(req, ctx);
    case "adminList":
      return handleAdminList(ctx);
    case "adminUpdate":
      return handleAdminUpdate(req, ctx, _params);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const currencies = await prisma.currency.findMany({ where: { isActive: true } });
    return success({ currencies });
  } catch (e) {
    return serverError(e);
  }
}

async function handleConvert(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const { from, to, amount } = await req.json() as { from: string; to: string; amount: number };
    if (!from || !to || !amount) return badRequest("From, to, and amount required");
    const prisma = getPrisma(ctx.env);
    const fromCurr = await prisma.currency.findUnique({ where: { code: from.toUpperCase() } });
    const toCurr = await prisma.currency.findUnique({ where: { code: to.toUpperCase() } });
    if (!fromCurr || !toCurr) return notFound("Currency not found");
    const baseAmount = amount / Number(fromCurr.exchangeRate);
    const converted = baseAmount * Number(toCurr.exchangeRate);
    return success({
      from, to, amount,
      converted: Math.round(converted * 100) / 100,
      rate: Number(toCurr.exchangeRate) / Number(fromCurr.exchangeRate),
    });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminList(ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const currencies = await prisma.currency.findMany({ orderBy: { code: "asc" } });
    return success({ currencies });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminUpdate(req: Request, ctx: RequestContext, params: string[]): Promise<Response> {
  try {
    const code = params[0]?.toUpperCase();
    if (!code) return badRequest("Currency code required");
    const { exchangeRate, isActive } = await req.json() as { exchangeRate?: number; isActive?: boolean };
    const prisma = getPrisma(ctx.env);
    const data: Record<string, unknown> = {};
    if (exchangeRate !== undefined) data.exchangeRate = exchangeRate;
    if (isActive !== undefined) data.isActive = isActive;
    const currency = await prisma.currency.update({ where: { code }, data });
    return success({ currency });
  } catch (e) {
    return serverError(e);
  }
}
