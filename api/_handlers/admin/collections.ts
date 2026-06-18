import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";

export async function handleAdminCollectionRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList();
    case "create":
      return handleCreate(req);
    case "update":
      return handleUpdate(params[0], req);
    case "delete":
      return handleDelete(params[0]);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(): Promise<Response> {
  try {
    const collections = await prisma.collection.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return success({ collections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request): Promise<Response> {
  const body = await req.json();
  const { name, description, heroImageUrl, isActive, isFeatured, startDate, endDate, sortOrder, metaTitle, metaDesc } = body;

  if (!name) return badRequest("Collection name is required");

  const slug = slugify(name);
  const slugExists = await prisma.collection.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const collection = await prisma.collection.create({
      data: {
        name,
        slug: finalSlug,
        description: description ?? null,
        heroImageUrl: heroImageUrl ?? null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        sortOrder: sortOrder ?? 0,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
      },
    });
    return created(collection);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(collectionId: string, req: Request): Promise<Response> {
  const body = await req.json();

  try {
    const existing = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!existing) return notFound("Collection not found");

    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "heroImageUrl", "isActive", "isFeatured", "sortOrder", "metaTitle", "metaDesc"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;

    if (body.name && body.name !== existing.name) {
      data.slug = slugify(body.name);
    }

    const collection = await prisma.collection.update({
      where: { id: collectionId },
      data: data as never,
    });
    return success(collection);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(collectionId: string): Promise<Response> {
  try {
    await prisma.collection.update({
      where: { id: collectionId },
      data: { isActive: false },
    });
    return success({ message: "Collection deactivated" });
  } catch (err) {
    return serverError(err);
  }
}
