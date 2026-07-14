import type { Env } from "../../_lib/env";
import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created, conflict } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { requireAdmin } from "../../_lib/auth-middleware";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { deleteMedia } from "../../_lib/media-service";
import { toNull } from "../../_lib/sanitize";

const VALID_LOCATIONS = ["header", "footer", "mobile", "sidebar"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

async function cleanupSectionMedia(existingContent: unknown, nextContent: unknown, env: Env): Promise<unknown> {
  // Extract public IDs from existing content and delete using MediaService
  const existingPublicIds = extractPublicIds(existingContent);
  const nextPublicIds = extractPublicIds(nextContent);
  const toDelete = existingPublicIds.filter(id => !nextPublicIds.includes(id));
  
  if (toDelete.length > 0) {
    const prisma = getPrisma(env);
    const mediaAssets = await prisma.media_assets.findMany({
      where: { publicId: { in: toDelete }, entityType: "cms" },
      select: { id: true },
    });
    await Promise.allSettled(
      mediaAssets.map(asset => deleteMedia(asset.id, env))
    );
  }
  return nextContent;
}

function extractPublicIds(content: unknown): string[] {
  const ids: string[] = [];
  
  function traverse(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }
    
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key.toLowerCase().includes('publicid') && typeof value === 'string') {
        ids.push(value);
      } else {
        traverse(value);
      }
    }
  }
  
  traverse(content);
  return ids;
}

export async function handleAdminCMSRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "pages":
      return handlePagesList(ctx.env!);
    case "page":
      return handleGetPage(params[0], ctx.env!);
    case "createPage":
      return handleCreatePage(req, ctx, ctx.env!);
    case "updatePage":
      return handleUpdatePage(params[0], req, ctx, ctx.env!);
    case "deletePage":
      return handleDeletePage(params[0], req, ctx, ctx.env!);
    case "homepage":
      return handleHomepageList(ctx.env!);
    case "createHomeSection":
      return handleCreateHomeSection(req, ctx, ctx.env!);
    case "updateHomeSection":
      return handleUpdateHomeSection(params[0], req, ctx, ctx.env!);
    case "deleteHomeSection":
      return handleDeleteHomeSection(params[0], req, ctx, ctx.env!);
    case "reorderHomeSections":
      return handleReorderHomeSections(req, ctx.env!);
    case "navigation":
      return handleNavigationList(ctx.env!);
    case "createNavigation":
      return handleCreateNavigation(req, ctx, ctx.env!);
    case "updateNavigation":
      return handleUpdateNavigation(params[0], req, ctx, ctx.env!);
    case "deleteNavigation":
      return handleDeleteNavigation(params[0], req, ctx, ctx.env!);
    case "footer":
      return handleFooterList(ctx.env!);
    case "createFooter":
      return handleCreateFooter(req, ctx, ctx.env!);
    case "updateFooter":
      return handleUpdateFooter(params[0], req, ctx, ctx.env!);
    case "deleteFooter":
      return handleDeleteFooter(params[0], req, ctx, ctx.env!);
    default:
      return badRequest("Unknown action");
  }
}

// ─── Static Pages ───

async function handlePagesList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const pages = await prisma.static_pages.findMany({
      orderBy: { createdAt: "desc" },
    });
    return success({ pages });
  } catch (err) {
    return serverError(err);
  }
}

async function handleGetPage(pageId: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const page = await prisma.static_pages.findUnique({ where: { id: pageId } });
    if (!page) return notFound("Page not found");
    return success({ page });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreatePage(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();
  const { title, content, template, isPublished, metaTitle, metaDesc, ogImage } = body;

  if (!title) return badRequest("Page title is required");

  const requestedSlug = typeof body.slug === "string" && body.slug.trim() ? body.slug : title;
  const slug = slugify(requestedSlug);
  if (!slug) return badRequest("Page slug is required");

  const prisma = getPrisma(env);
  const slugExists = await prisma.static_pages.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const page = await prisma.static_pages.create({
      data: {
        title,
        slug: finalSlug,
        content: content ?? null,
        template: template ?? "default",
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
        ogImage: ogImage ?? null,
      },
    });
    await logAction(ctx.userId, "admin.cms.page.create", {
      entity: "staticPage",
      entityId: page.id,
      metadata: { title: page.title, slug: page.slug },
      ...extractRequestMeta(req),
    }, env);
    return created(page);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdatePage(pageId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.static_pages.findUnique({ where: { id: pageId } });
    if (!existing) return notFound("Page not found");

    const data: Record<string, unknown> = {};
    const fields = ["title", "template", "metaTitle", "metaDesc"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.slug !== undefined) {
      const slug = slugify(String(body.slug));
      if (!slug) return badRequest("Page slug is required");
      if (slug !== existing.slug) {
        const duplicate = await prisma.static_pages.findUnique({ where: { slug } });
        if (duplicate) return conflict(`A page with slug "${slug}" already exists`);
      }
      data.slug = slug;
    }
    if (body.ogImage !== undefined) data.ogImage = toNull(body.ogImage);
    if (body.isPublished !== undefined) {
      data.isPublished = body.isPublished;
      data.publishedAt = body.isPublished ? new Date() : null;
    }
    if (body.content !== undefined) {
      data.content = await cleanupSectionMedia(existing.content, body.content, env);
    }

    const page = await prisma.static_pages.update({
      where: { id: pageId },
      data: data as never,
    });
    await logAction(ctx.userId, "admin.cms.page.update", {
      entity: "staticPage",
      entityId: page.id,
      metadata: { title: page.title },
      ...extractRequestMeta(req),
    }, env);
    return success(page);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeletePage(pageId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const page = await prisma.static_pages.findUnique({ where: { id: pageId } });
    if (!page) return notFound("Page not found");
    if (page.ogImage) {
      const mediaAsset = await prisma.media_assets.findFirst({
        where: { publicId: page.ogImage, entityType: "cms", entityId: pageId },
        select: { id: true },
      });
      if (mediaAsset) {
        await deleteMedia(mediaAsset.id, env);
      }
    }
    await cleanupSectionMedia(page.content, {}, env);
    await prisma.static_pages.delete({ where: { id: pageId } });
    await logAction(ctx.userId, "admin.cms.page.delete", {
      entity: "staticPage",
      entityId: pageId,
      ...extractRequestMeta(req),
    }, env);
    return success({ message: "Page deleted" });
  } catch (err) {
    return serverError(err);
  }
}

// ─── Homepage Sections ───

async function handleHomepageList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const sections = await prisma.homepage_sections.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateHomeSection(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();
  const { sectionType, title, subtitle, content, styles, sortOrder, isActive, visibility, publishAt, expireAt } = body;

  if (!sectionType) return badRequest("Section type is required");

  try {
    const prisma = getPrisma(env);
    const section = await prisma.homepage_sections.create({
      data: {
        sectionType,
        title: title ?? null,
        subtitle: subtitle ?? null,
        content: content ?? null,
        styles: styles ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        visibility: visibility ?? "all",
        publishAt: publishAt ? new Date(publishAt) : null,
        expireAt: expireAt ? new Date(expireAt) : null,
      },
    });
    await logAction(ctx.userId, "admin.cms.homepage.create", {
      entity: "homepageSection",
      entityId: section.id,
      metadata: { sectionType: section.sectionType, title: section.title },
      ...extractRequestMeta(req),
    }, env);
    return created(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateHomeSection(sectionId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.homepage_sections.findUnique({ where: { id: sectionId } });
    if (!existing) return notFound("Section not found");

    const data: Record<string, unknown> = {};
    const fields = ["sectionType", "title", "subtitle", "content", "styles", "sortOrder", "isActive", "visibility"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.publishAt !== undefined) data.publishAt = body.publishAt ? new Date(body.publishAt) : null;
    if (body.expireAt !== undefined) data.expireAt = body.expireAt ? new Date(body.expireAt) : null;
    if (body.content !== undefined) {
      data.content = await cleanupSectionMedia(existing.content, body.content, env);
    }

    const section = await prisma.homepage_sections.update({
      where: { id: sectionId },
      data: data as never,
    });
    await logAction(ctx.userId, "admin.cms.homepage.update", {
      entity: "homepageSection",
      entityId: section.id,
      metadata: { sectionType: section.sectionType },
      ...extractRequestMeta(req),
    }, env);
    return success(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteHomeSection(sectionId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const section = await prisma.homepage_sections.findUnique({ where: { id: sectionId } });
    if (!section) return notFound("Section not found");
    // Clean up all media in the section content by comparing with empty (removes everything)
    const cleaned = await cleanupSectionMedia(section.content, {}, env);
    const sectionContent = asRecord(cleaned);
    if (sectionContent?.imagePublicId) {
      const mediaAsset = await prisma.media_assets.findFirst({
        where: { publicId: String(sectionContent.imagePublicId), entityType: "cms", entityId: sectionId },
        select: { id: true },
      });
      if (mediaAsset) {
        await deleteMedia(mediaAsset.id, env);
      }
    }
    await prisma.homepage_sections.delete({ where: { id: sectionId } });
    await logAction(ctx.userId, "admin.cms.homepage.delete", {
      entity: "homepageSection",
      entityId: sectionId,
      ...extractRequestMeta(req),
    }, env);
    return success({ message: "Section deleted" });
  } catch (err) {
    return serverError(err);
  }
}

async function handleReorderHomeSections(req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  const { order } = body;

  if (!Array.isArray(order)) return badRequest("Order array is required");

  try {
    const prisma = getPrisma(env);
    await prisma.$transaction(
      order.map((item: { id: string; sortOrder: number }) =>
        prisma.homepage_sections.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
    return success({ message: "Sections reordered" });
  } catch (err) {
    return serverError(err);
  }
}

// ─── Navigation ───

async function handleNavigationList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const menus = await prisma.navigation_menus.findMany({
      orderBy: { createdAt: "asc" },
    });
    return success({ menus });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateNavigation(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();
  const { name, location, items, isActive } = body;

  if (!name || !location || items === undefined || items === null) {
    return badRequest("Name, location, and items are required");
  }
  if (!VALID_LOCATIONS.includes(location)) {
    return badRequest(`Invalid location. Must be one of: ${VALID_LOCATIONS.join(", ")}`);
  }
  if (!Array.isArray(items)) {
    return badRequest("Items must be an array");
  }

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.navigation_menus.findFirst({
      where: { name, location },
    });
    if (existing) {
      return conflict(`A menu named "${name}" already exists for this location`);
    }

    const menu = await prisma.navigation_menus.create({
      data: {
        name,
        location,
        items,
        isActive: isActive ?? true,
      },
    });
    await logAction(ctx.userId, "admin.cms.navigation.create", {
      entity: "navigationMenu",
      entityId: menu.id,
      metadata: { name: menu.name, location: menu.location },
      ...extractRequestMeta(req),
    }, env);
    return created(menu);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateNavigation(menuId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.navigation_menus.findUnique({ where: { id: menuId } });
    if (!existing) return notFound("Navigation menu not found");

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.location !== undefined) {
      if (!VALID_LOCATIONS.includes(body.location)) {
        return badRequest(`Invalid location. Must be one of: ${VALID_LOCATIONS.join(", ")}`);
      }
      data.location = body.location;
    }
    if (body.items !== undefined) {
      if (!Array.isArray(body.items)) {
        return badRequest("Items must be an array");
      }
      data.items = body.items;
    }
    if (body.isActive !== undefined) data.isActive = body.isActive;

    if (Object.keys(data).length === 0) {
      return badRequest("No fields to update");
    }

    // Check duplicate if name or location changed
    const newName = body.name ?? existing.name;
    const newLocation = body.location ?? existing.location;
    const duplicate = await prisma.navigation_menus.findFirst({
      where: { name: newName, location: newLocation, id: { not: menuId } },
    });
    if (duplicate) {
      return conflict(`A menu named "${newName}" already exists for this location`);
    }

    const menu = await prisma.navigation_menus.update({
      where: { id: menuId },
      data: data as never,
    });
    await logAction(ctx.userId, "admin.cms.navigation.update", {
      entity: "navigationMenu",
      entityId: menu.id,
      metadata: { name: menu.name },
      ...extractRequestMeta(req),
    }, env);
    return success(menu);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteNavigation(menuId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.navigation_menus.findUnique({ where: { id: menuId } });
    if (!existing) return notFound("Navigation menu not found");

    await prisma.navigation_menus.delete({ where: { id: menuId } });
    await logAction(ctx.userId, "admin.cms.navigation.delete", {
      entity: "navigationMenu",
      entityId: menuId,
      ...extractRequestMeta(req),
    }, env);
    return success({ message: "Menu deleted" });
  } catch (err) {
    return serverError(err);
  }
}

// ─── Footer Sections ───

async function handleFooterList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const sections = await prisma.footer_sections.findMany({
      orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateFooter(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();
  const { column, title, contentType, content, sortOrder, isActive } = body;

  if (!title) return badRequest("Footer section title is required");

  try {
    const prisma = getPrisma(env);
    const section = await prisma.footer_sections.create({
      data: {
        column: column ?? 1,
        title,
        contentType: contentType ?? "links",
        content: content ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });
    await logAction(ctx.userId, "admin.cms.footer.create", {
      entity: "footerSection",
      entityId: section.id,
      metadata: { title: section.title, column: section.column },
      ...extractRequestMeta(req),
    }, env);
    return created(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateFooter(sectionId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    const fields = ["column", "title", "contentType", "content", "sortOrder", "isActive"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const section = await prisma.footer_sections.update({
      where: { id: sectionId },
      data: data as never,
    });
    await logAction(ctx.userId, "admin.cms.footer.update", {
      entity: "footerSection",
      entityId: section.id,
      metadata: { title: section.title },
      ...extractRequestMeta(req),
    }, env);
    return success(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteFooter(sectionId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.footer_sections.delete({ where: { id: sectionId } });
    await logAction(ctx.userId, "admin.cms.footer.delete", {
      entity: "footerSection",
      entityId: sectionId,
      ...extractRequestMeta(req),
    }, env);
    return success({ message: "Footer section deleted" });
  } catch (err) {
    return serverError(err);
  }
}
