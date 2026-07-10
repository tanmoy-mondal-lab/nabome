import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError, notFound, conflict, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function handleReferralRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "myCode":
      return handleMyCode(req, ctx);
    case "claim":
      return handleClaim(req, ctx);
    case "myReferrals":
      return handleMyReferrals(req, ctx);
    case "generateCode":
      return handleGenerateCode(req, ctx);
    case "adminList":
      return handleAdminList(ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleMyCode(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    let code = await prisma.referral_codes.findUnique({ where: { profileId: ctx.userId } });
    if (!code) {
      code = await prisma.referral_codes.create({
        data: { profileId: ctx.userId, code: generateReferralCode() },
      });
    }
    return success({ referralCode: code });
  } catch (e) {
    return serverError(e);
  }
}

async function handleClaim(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const { code, email } = await req.json() as { code: string; email: string };
    if (!code || !email) return badRequest("Referral code and email required");
    const prisma = getPrisma(ctx.env);
    const referralCode = await prisma.referral_codes.findUnique({ where: { code: code.toUpperCase() } });
    if (!referralCode || !referralCode.isActive) return notFound("Invalid referral code");
    const existing = await prisma.referrals.findFirst({ where: { referrerCodeId: referralCode.id, referredEmail: email } });
    if (existing) return conflict("Email already referred");
    await prisma.referrals.create({
      data: { referrerCodeId: referralCode.id, referredEmail: email, status: "pending" },
    });
    return success({ claimed: true });
  } catch (e) {
    return serverError(e);
  }
}

async function handleMyReferrals(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    const code = await prisma.referral_codes.findUnique({ where: { profileId: ctx.userId } });
    if (!code) return success({ referrals: [] });
    const referrals = await prisma.referrals.findMany({
      where: { referrerCodeId: code.id },
      orderBy: { createdAt: "desc" },
    });
    return success({ referrals, referralCode: code });
  } catch (e) {
    return serverError(e);
  }
}

async function handleGenerateCode(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    const existing = await prisma.referral_codes.findUnique({ where: { profileId: ctx.userId } });
    if (existing) return success({ referralCode: existing });
    const code = await prisma.referral_codes.create({
      data: { profileId: ctx.userId, code: generateReferralCode() },
    });
    return success({ referralCode: code });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminList(ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const referrals = await prisma.referrals.findMany({
      include: { referrerCode: { include: { profile: { select: { id: true, email: true, firstName: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return success({ referrals });
  } catch (e) {
    return serverError(e);
  }
}
