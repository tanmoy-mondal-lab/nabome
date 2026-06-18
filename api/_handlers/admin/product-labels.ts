import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";

export async function handleAdminProductLabelRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "listLabels": return handleListLabels();
    case "createLabel": return handleCreateLabel(req);
    case "updateLabel": return handleUpdateLabel(params[0], req);
    case "deleteLabel": return handleDeleteLabel(params[0]);
    case "listTags": return handleListTags();
    case "createTag": return handleCreateTag(req);
    case "deleteTag": return handleDeleteTag(params[0]);
    case "assignLabels": return handleAssignLabels(params[0], req);
    case "assignTags": return handleAssignTags(params[0], req);
    default: return badRequest("Unknown action");
  }
}

async function handleListLabels(): Promise<Response> {
  try {
    const labels = await prisma.productLabel.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" as const },
    });
    return success({ labels });
  } catch (err) { return serverError(err); }
}

async function handleCreateLabel(req: Request): Promise<Response> {
  const body = await req.json();
  const { name, color } = body;
  if (!name) return badRequest("Label name is required");
  const slug = slugify(name);
  const slugExists = await prisma.productLabel.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  try {
    const label = await prisma.productLabel.create({ data: { name, slug: finalSlug, color } });
    return created(label);
  } catch (err) { return serverError(err); }
}

async function handleUpdateLabel(id: string, req: Request): Promise<Response> {
  const body = await req.json();
  try {
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) { data.name = body.name; data.slug = slugify(body.name); }
    if (body.color !== undefined) data.color = body.color;
    const label = await prisma.productLabel.update({ where: { id }, data: data as never });
    return success(label);
  } catch (err) { return notFound("Label not found"); }
}

async function handleDeleteLabel(id: string): Promise<Response> {
  try {
    await prisma.productLabel.delete({ where: { id } });
    return success({ message: "Label deleted" });
  } catch (err) { return notFound("Label not found"); }
}

async function handleListTags(): Promise<Response> {
  try {
    const tags = await prisma.productTag.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" as const },
    });
    return success({ tags });
  } catch (err) { return serverError(err); }
}

async function handleCreateTag(req: Request): Promise<Response> {
  const body = await req.json();
  const { name } = body;
  if (!name) return badRequest("Tag name is required");
  const slug = slugify(name);
  try {
    const tag = await prisma.productTag.upsert({
      where: { slug },
      create: { name, slug },
      update: { name },
    });
    return created(tag);
  } catch (err) { return serverError(err); }
}

async function handleDeleteTag(id: string): Promise<Response> {
  try {
    await prisma.productTag.delete({ where: { id } });
    return success({ message: "Tag deleted" });
  } catch (err) { return notFound("Tag not found"); }
}

async function handleAssignLabels(productId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { labelIds } = body;
  if (!Array.isArray(labelIds)) return badRequest("labelIds array required");
  try {
    await prisma.productLabelOnProduct.deleteMany({ where: { productId } });
    if (labelIds.length > 0) {
      await prisma.productLabelOnProduct.createMany({
        data: labelIds.map((labelId: string) => ({ productId, labelId })),
      });
    }
    return success({ message: "Labels updated" });
  } catch (err) { return serverError(err); }
}

async function handleAssignTags(productId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { tagIds } = body;
  if (!Array.isArray(tagIds)) return badRequest("tagIds array required");
  try {
    await prisma.productTagOnProduct.deleteMany({ where: { productId } });
    if (tagIds.length > 0) {
      await prisma.productTagOnProduct.createMany({
        data: tagIds.map((tagId: string) => ({ productId, tagId })),
      });
    }
    return success({ message: "Tags updated" });
  } catch (err) { return serverError(err); }
}
