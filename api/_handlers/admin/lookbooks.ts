import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";

export async function handleAdminLookbookRequest(
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
    case "addItem":
      return handleAddItem(params[0], req);
    case "removeItem":
      return handleRemoveItem(params[0], params[1]);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(): Promise<Response> {
  try {
    const lookbooks = await prisma.lookbook.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return success({ lookbooks });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request): Promise<Response> {
  const body = await req.json();
  const { name, description, coverImageUrl, isActive, sortOrder } = body;

  if (!name || !coverImageUrl) return badRequest("Name and cover image are required");

  const slug = slugify(name);
  const slugExists = await prisma.lookbook.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const lookbook = await prisma.lookbook.create({
      data: {
        name,
        slug: finalSlug,
        description: description ?? null,
        coverImageUrl,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    return created(lookbook);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(lookbookId: string, req: Request): Promise<Response> {
  const body = await req.json();
  try {
    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "coverImageUrl", "isActive", "sortOrder"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.name) data.slug = slugify(body.name);

    const lookbook = await prisma.lookbook.update({
      where: { id: lookbookId },
      data: data as never,
    });
    return success(lookbook);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(lookbookId: string): Promise<Response> {
  try {
    await prisma.lookbook.delete({ where: { id: lookbookId } });
    return success({ message: "Lookbook deleted" });
  } catch (err) {
    return notFound("Lookbook not found");
  }
}

async function handleAddItem(lookbookId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { imageUrl, productId, hotspotX, hotspotY, caption, sortOrder } = body;

  if (!imageUrl) return badRequest("Image URL is required");

  try {
    const item = await prisma.lookbookItem.create({
      data: {
        lookbookId,
        imageUrl,
        productId: productId ?? null,
        hotspotX: hotspotX ?? null,
        hotspotY: hotspotY ?? null,
        caption: caption ?? null,
        sortOrder: sortOrder ?? 0,
      },
    });
    return created(item);
  } catch (err) {
    return serverError(err);
  }
}

async function handleRemoveItem(lookbookId: string, itemId: string): Promise<Response> {
  try {
    await prisma.lookbookItem.delete({
      where: { id: itemId, lookbookId },
    });
    return success({ message: "Item removed from lookbook" });
  } catch (err) {
    return notFound("Item not found");
  }
}
