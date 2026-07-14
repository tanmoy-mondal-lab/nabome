import type { Env } from "../../_lib/env";
import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { requireAdmin } from "../../_lib/auth-middleware";
import { deleteMedia } from "../../_lib/media-service";
import { toNull } from "../../_lib/sanitize";

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
      return handleList(ctx.env!);
    case "create":
      return handleCreate(req, ctx.env!);
    case "detail":
      return handleDetail(params[0], ctx.env!);
    case "update":
      return handleUpdate(params[0], req, ctx.env!);
    case "delete":
      return handleDelete(params[0], ctx.env!);
    case "apply":
      return handleApply(params[0], req, ctx.env!);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const templates = await prisma.page_templates.findMany({
      orderBy: { useCount: "desc" },
    });
    return success({ templates });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(id: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const template = await prisma.page_templates.findUnique({ where: { id } });
    if (!template) return notFound("Template not found");
    return success({ template });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  const { name, description, category, thumbnail, thumbnailPublicId, sections, metadata } = body;

  if (!name || !sections) return badRequest("Name and sections are required");

  const slug = slugify(name);
  const prisma = getPrisma(env);
  const slugExists = await prisma.page_templates.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const template = await prisma.page_templates.create({
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

async function handleUpdate(templateId: string, req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.page_templates.findUnique({ where: { id: templateId } });
    if (!existing) return notFound("Template not found");

    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "category", "thumbnail", "sections", "metadata", "isActive"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = field === "thumbnail" ? toNull(body[field]) : body[field];
    }
    // Handle thumbnail media replacement using MediaService
    if (body.thumbnailPublicId !== undefined && existing.thumbnailPublicId !== body.thumbnailPublicId) {
      if (existing.thumbnailPublicId) {
        const oldMediaAsset = await prisma.media_assets.findFirst({
          where: { publicId: existing.thumbnailPublicId, entityType: "cms", entityId: templateId },
        });
        if (oldMediaAsset) {
          await deleteMedia(oldMediaAsset.id, env);
        }
      }
      data.thumbnailPublicId = body.thumbnailPublicId;
    }
    if (body.name) data.slug = slugify(body.name);

    const template = await prisma.page_templates.update({
      where: { id: templateId },
      data: data as never,
    });
    return success(template);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(templateId: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const template = await prisma.page_templates.findUnique({ where: { id: templateId } });
    if (!template) return notFound("Template not found");
    if (template.thumbnailPublicId) {
      const mediaAsset = await prisma.media_assets.findFirst({
        where: { publicId: template.thumbnailPublicId, entityType: "cms", entityId: templateId },
        select: { id: true },
      });
      if (mediaAsset) {
        await deleteMedia(mediaAsset.id, env);
      }
    }
    await prisma.page_templates.delete({ where: { id: templateId } });
    return success({ message: "Template deleted" });
  } catch (err) {
    return notFound("Template not found");
  }
}

async function handleApply(templateId: string, req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  const { pageId } = body;
  if (!pageId) return badRequest("pageId is required");

  try {
    const prisma = getPrisma(env);
    const [template, page] = await Promise.all([
      prisma.page_templates.findUnique({ where: { id: templateId } }),
      prisma.static_pages.findUnique({ where: { id: pageId } }),
    ]);
    if (!template) return notFound("Template not found");
    if (!page) return notFound("Page not found");

    const updated = await prisma.static_pages.update({
      where: { id: pageId },
      data: { content: template.sections as never },
    });

    await prisma.page_templates.update({
      where: { id: templateId },
      data: { useCount: { increment: 1 } },
    });

    return success({ page: updated });
  } catch (err) {
    return serverError(err);
  }
}
