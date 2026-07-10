import { getPrisma } from "../_lib/prisma";
import { success, serverError, notFound } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleBrandRequest(
  _req: Request,
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
    const brands = await prisma.brands.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    });
    return success({ brands });
  } catch (err) { return serverError(err); }
}

async function handleDetail(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const brand = await prisma.brands.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        websiteUrl: true,
      },
    });
    if (!brand) return notFound("Brand not found");
    return success({ brand });
  } catch (err) { return serverError(err); }
}
