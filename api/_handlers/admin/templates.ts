import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminTemplateRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list":
      return handleList(ctx.env);
    case "create":
      return handleCreate(req, ctx.env);
    case "detail":
      return handleDetail(params[0], ctx.env);
    case "update":
      return handleUpdate(params[0], req, ctx.env);
    case "delete":
      return handleDelete(params[0], ctx.env);
    case "apply":
      return handleApply(params[0], req, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const templates = await prisma.pageTemplate.findMany({
      orderBy: { useCount: "desc" },
    });
    return success({ templates });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const template = await prisma.pageTemplate.findUnique({ where: { id } });
    if (!template) return notFound("Template not found");
    return success({ template });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { name, description, category, thumbnail, thumbnailPublicId, sections, metadata } = body;

  if (!name || !sections) return badRequest("Name and sections are required");

  const slug = slugify(name);
  const prisma = getPrisma(env);
  const slugExists = await prisma.pageTemplate.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const template = await prisma.pageTemplate.create({
      data: {
        name,
        slug: finalSlug,
        description: description ?? null,
        category: category ?? "custom",
        thumbnail: thumbnail ?? null,
        thumbnailPublicId: thumbnailPublicId ?? null,
        sections,
        metadata: metadata ?? null,
      },
    });
    return created(template);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(templateId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.pageTemplate.findUnique({ where: { id: templateId } });
    if (!existing) return notFound("Template not found");

    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "category", "thumbnail", "thumbnailPublicId", "sections", "metadata", "isActive"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.name) data.slug = slugify(body.name);

    const template = await prisma.pageTemplate.update({
      where: { id: templateId },
      data: data as never,
    });
    return success(template);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(templateId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.pageTemplate.delete({ where: { id: templateId } });
    return success({ message: "Template deleted" });
  } catch (err) {
    return notFound("Template not found");
  }
}

async function handleApply(templateId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { pageId } = body;
  if (!pageId) return badRequest("pageId is required");

  try {
    const prisma = getPrisma(env);
    const [template, page] = await Promise.all([
      prisma.pageTemplate.findUnique({ where: { id: templateId } }),
      prisma.staticPage.findUnique({ where: { id: pageId } }),
    ]);
    if (!template) return notFound("Template not found");
    if (!page) return notFound("Page not found");

    const updated = await prisma.staticPage.update({
      where: { id: pageId },
      data: { content: template.sections as never },
    });

    await prisma.pageTemplate.update({
      where: { id: templateId },
      data: { useCount: { increment: 1 } },
    });

    return success({ page: updated });
  } catch (err) {
    return serverError(err);
  }
}
