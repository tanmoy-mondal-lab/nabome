import type { Env } from "../_lib/env";
import { getPrisma } from "../_lib/prisma";
import { success, serverError, notFound } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleCampaignRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list": return handleList(req, ctx.env!);
    case "active": return handleActive(ctx.env!);
    case "detail": return handleDetail(params[0], ctx.env!);
    default: return serverError("Unknown action");
  }
}

async function handleList(req: Request, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    
    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;

    const campaigns = await prisma.campaigns.findMany({
      where: where as never,
      orderBy: { startDate: "desc" },
    });
    return success({ campaigns });
  } catch (err) { return serverError(err); }
}

async function handleActive(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const now = new Date();
    
    const campaigns = await prisma.campaigns.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { startDate: "desc" },
    });
    return success({ campaigns });
  } catch (err) { return serverError(err); }
}

async function handleDetail(id: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const campaign = await prisma.campaigns.findUnique({
      where: { id },
    });
    if (!campaign) return notFound("Campaign not found");
    return success({ campaign });
  } catch (err) { return serverError(err); }
}
