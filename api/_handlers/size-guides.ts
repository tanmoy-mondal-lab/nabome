import { getPrisma } from "../_lib/prisma";
import { success, serverError, notFound } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleSizeGuideRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list": return handleList(ctx.env);
    case "detail": return handleDetail(params[0], ctx.env);
    default: return serverError("Unknown action");
  }
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const guides = await prisma.sizeGuide.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { name: "asc" },
    });
    return success({ sizeGuides: guides });
  } catch (err) { return serverError(err); }
}

async function handleDetail(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const guide = await prisma.sizeGuide.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!guide) return notFound("Size guide not found");
    return success({ sizeGuide: guide });
  } catch (err) { return serverError(err); }
}
