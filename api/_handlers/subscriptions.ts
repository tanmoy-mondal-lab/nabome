import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError, notFound, created, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";


export async function handleSubscriptionRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "plans":
      return handlePlans(ctx);
    case "mySubscription":
      return handleMySubscription(req, ctx);
    case "create":
      return handleCreate(req, ctx);
    case "cancel":
      return handleCancel(req, ctx);
    case "invoices":
      return handleInvoices(req, ctx);
    case "adminPlans":
      return handleAdminPlans(ctx);
    case "adminCreatePlan":
      return handleAdminCreatePlan(req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handlePlans(ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return success({ plans });
  } catch (e) {
    return serverError(e);
  }
}

async function handleMySubscription(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    const subscription = await prisma.subscription.findFirst({
      where: { profileId: ctx.userId, status: { in: ["active", "trial", "past_due"] } },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
    return success({ subscription });
  } catch (e) {
    return serverError(e);
  }
}

async function handleCreate(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const { planId, razorpaySubscriptionId } = await req.json() as { planId: string; razorpaySubscriptionId?: string };
    if (!planId) return badRequest("Plan ID required");
    const prisma = getPrisma(ctx.env);
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return notFound("Plan not found");
    const existing = await prisma.subscription.findFirst({
      where: { profileId: ctx.userId, status: { in: ["active", "trial", "past_due"] } },
    });
    if (existing) return badRequest("Already have an active subscription");
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (plan.interval === "yearly" ? 12 : 1));
    const trialEnd = plan.trialPeriodDays > 0 ? new Date(now.getTime() + plan.trialPeriodDays * 86400000) : null;
    const subscription = await prisma.subscription.create({
      data: {
        profileId: ctx.userId,
        planId: plan.id,
        status: trialEnd && trialEnd > now ? "trial" : "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEndsAt: trialEnd,
        razorpaySubscriptionId: razorpaySubscriptionId || undefined,
        nextBillingAt: periodEnd,
      },
    });
    return created({ subscription });
  } catch (e) {
    return serverError(e);
  }
}

async function handleCancel(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    const subscription = await prisma.subscription.findFirst({
      where: { profileId: ctx.userId, status: { in: ["active", "trial", "past_due"] } },
    });
    if (!subscription) return notFound("No active subscription found");
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
    return success({ cancelled: true });
  } catch (e) {
    return serverError(e);
  }
}

async function handleInvoices(_req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    const subscription = await prisma.subscription.findFirst({
      where: { profileId: ctx.userId },
      orderBy: { createdAt: "desc" },
    });
    if (!subscription) return success({ invoices: [] });
    const invoices = await prisma.subscriptionInvoice.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: "desc" },
    });
    return success({ invoices });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminPlans(ctx: RequestContext): Promise<Response> {
  try {
    const prisma = getPrisma(ctx.env);
    const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } });
    return success({ plans });
  } catch (e) {
    return serverError(e);
  }
}

async function handleAdminCreatePlan(req: Request, ctx: RequestContext): Promise<Response> {
  try {
    const body = await req.json() as {
      name: string; slug: string; price: number; description?: string; interval?: string;
      trialPeriodDays?: number; features?: unknown; sortOrder?: number;
    };
    if (!body.name || !body.slug || !body.price) return badRequest("Name, slug, and price required");
    const prisma = getPrisma(ctx.env);
    const plan = await prisma.subscriptionPlan.create({ data: body as any });
    return created({ plan });
  } catch (e) {
    return serverError(e);
  }
}
