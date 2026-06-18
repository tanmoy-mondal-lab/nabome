import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminRelatedProductRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list": return handleList(params[0]);
    case "create": return handleCreate(req);
    case "delete": return handleDelete(params[0]);
    case "reorder": return handleReorder(params[0], req);
    default: return badRequest("Unknown action");
  }
}

async function handleList(productId: string): Promise<Response> {
  try {
    const [relatedTo, relatedFrom] = await Promise.all([
      prisma.relatedProduct.findMany({
        where: { sourceId: productId },
        include: { target: { select: { id: true, name: true, slug: true, basePrice: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } } },
        orderBy: { sortOrder: "asc" as const },
      }),
      prisma.relatedProduct.findMany({
        where: { targetId: productId },
        include: { source: { select: { id: true, name: true, slug: true, basePrice: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } } },
        orderBy: { sortOrder: "asc" as const },
      }),
    ]);
    const related = relatedTo.map((r) => ({ ...r, direction: "to" as const }));
    const reverse = relatedFrom.map((r) => ({ ...r, direction: "from" as const, target: r.source }));
    return success({ related: [...related, ...reverse] });
  } catch (err) { return serverError(err); }
}

async function handleCreate(req: Request): Promise<Response> {
  const body = await req.json();
  const { sourceId, targetId, type, sortOrder } = body;
  if (!sourceId || !targetId) return badRequest("sourceId and targetId are required");
  if (sourceId === targetId) return badRequest("Cannot relate a product to itself");
  try {
    const existing = await prisma.relatedProduct.findUnique({
      where: { sourceId_targetId_type: { sourceId, targetId, type: type ?? "related" } },
    });
    if (existing) return success(existing);
    const related = await prisma.relatedProduct.create({
      data: { sourceId, targetId, type: type ?? "related", sortOrder: sortOrder ?? 0 },
      include: { target: { select: { id: true, name: true, slug: true, basePrice: true, images: { where: { isPrimary: true }, take: 1, select: { url: true } } } } },
    });
    return created(related);
  } catch (err) { return serverError(err); }
}

async function handleDelete(id: string): Promise<Response> {
  try {
    await prisma.relatedProduct.delete({ where: { id } });
    return success({ message: "Relation removed" });
  } catch (err) { return notFound("Relation not found"); }
}

async function handleReorder(productId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { order } = body;
  if (!Array.isArray(order)) return badRequest("Order array required");
  try {
    await prisma.$transaction(
      order.map((item: { id: string; sortOrder: number }) =>
        prisma.relatedProduct.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
      )
    );
    return success({ message: "Reordered" });
  } catch (err) { return serverError(err); }
}
