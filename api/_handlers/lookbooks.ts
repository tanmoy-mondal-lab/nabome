import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleLookbookRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList(ctx.env);
    case "detail":
      return handleDetail(params[0], ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

env: anyasync function handleList(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const lookbooks = await prisma.lookbook.findMany({
      where: { isActive: true },
      include: { _count: { select: { items: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return success({ lookbooks });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const lookbook = await prisma.lookbook.findFirst({
      where: { slug, isActive: true },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                images: { take: 1, where: { isPrimary: true } },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!lookbook) return notFound("Lookbook not found");

    return success({ lookbook });
  } catch (err) {
    return serverError(err);
  }
}
