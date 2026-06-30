import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created, conflict } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { requireAdmin } from "../../_lib/auth-middleware";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { destroyCloudinaryAsset, destroyCloudinaryDiff } from "../../_lib/cloudinary";
import { toNull } from "../../_lib/sanitize";

const VALID_LOCATIONS = ["header", "footer", "mobile", "sidebar"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

async function cleanupSectionMedia(existingContent: unknown, nextContent: unknown, env: any): Promise<unknown> {
  await destroyCloudinaryDiff(existingContent, nextContent, env);
  return nextContent;
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
      return handlePagesList(ctx.env);
    case "page":
      return handleGetPage(params[0], ctx.env);
    case "createPage":
      return handleCreatePage(req, ctx, ctx.env);
    case "updatePage":
      return handleUpdatePage(params[0], req, ctx, ctx.env);
    case "deletePage":
      return handleDeletePage(params[0], req, ctx, ctx.env);
    case "homepage":
      return handleHomepageList(ctx.env);
    case "createHomeSection":
      return handleCreateHomeSection(req, ctx, ctx.env);
    case "updateHomeSection":
      return handleUpdateHomeSection(params[0], req, ctx, ctx.env);
    case "deleteHomeSection":
      return handleDeleteHomeSection(params[0], req, ctx, ctx.env);
    case "reorderHomeSections":
      return handleReorderHomeSections(req, ctx.env);
    case "navigation":
      return handleNavigationList(ctx.env);
    case "createNavigation":
      return handleCreateNavigation(req, ctx, ctx.env);
    case "updateNavigation":
      return handleUpdateNavigation(params[0], req, ctx, ctx.env);
    case "deleteNavigation":
      return handleDeleteNavigation(params[0], req, ctx, ctx.env);
    case "footer":
      return handleFooterList(ctx.env);
    case "createFooter":
      return handleCreateFooter(req, ctx, ctx.env);
    case "updateFooter":
      return handleUpdateFooter(params[0], req, ctx, ctx.env);
    case "deleteFooter":
      return handleDeleteFooter(params[0], req, ctx, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

// ─── Static Pages ───

async function handlePagesList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const pages = await prisma.staticPage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return success({ pages });
  } catch (err) {
    return serverError(err);
  }
}

async function handleGetPage(pageId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const page = await prisma.staticPage.findUnique({ where: { id: pageId } });
    if (!page) return notFound("Page not found");
    return success({ page });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreatePage(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { title, content, template, isPublished, metaTitle, metaDesc, ogImage } = body;

  if (!title) return badRequest("Page title is required");

  const requestedSlug = typeof body.slug === "string" && body.slug.trim() ? body.slug : title;
  const slug = slugify(requestedSlug);
  if (!slug) return badRequest("Page slug is required");

  const prisma = getPrisma(env);
  const slugExists = await prisma.staticPage.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const page = await prisma.staticPage.create({
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

async function handleUpdatePage(pageId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.staticPage.findUnique({ where: { id: pageId } });
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
        const duplicate = await prisma.staticPage.findUnique({ where: { slug } });
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

    const page = await prisma.staticPage.update({
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

async function handleDeletePage(pageId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const page = await prisma.staticPage.findUnique({ where: { id: pageId } });
    if (!page) return notFound("Page not found");
    if (page.ogImage) {
      await destroyCloudinaryAsset(page.ogImage, env);
    }
    await prisma.staticPage.delete({ where: { id: pageId } });
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

async function handleHomepageList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateHomeSection(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { sectionType, title, subtitle, content, styles, sortOrder, isActive, visibility, publishAt, expireAt } = body;

  if (!sectionType) return badRequest("Section type is required");

  try {
    const prisma = getPrisma(env);
    const section = await prisma.homepageSection.create({
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

async function handleUpdateHomeSection(sectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.homepageSection.findUnique({ where: { id: sectionId } });
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

    const section = await prisma.homepageSection.update({
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

async function handleDeleteHomeSection(sectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const section = await prisma.homepageSection.findUnique({ where: { id: sectionId } });
    if (!section) return notFound("Section not found");
    const cleaned = await cleanupSectionMedia(section.content, section.content, env);
    const sectionContent = asRecord(cleaned);
    if (sectionContent?.imagePublicId) {
      await destroyCloudinaryAsset(String(sectionContent.imagePublicId), env);
    }
    await prisma.homepageSection.delete({ where: { id: sectionId } });
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

async function handleReorderHomeSections(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { order } = body;

  if (!Array.isArray(order)) return badRequest("Order array is required");

  try {
    const prisma = getPrisma(env);
    await prisma.$transaction(
      order.map((item: { id: string; sortOrder: number }) =>
        prisma.homepageSection.update({
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

async function handleNavigationList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const menus = await prisma.navigationMenu.findMany({
      orderBy: { createdAt: "asc" },
    });
    return success({ menus });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateNavigation(req: Request, ctx: RequestContext, env: any): Promise<Response> {
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
    const existing = await prisma.navigationMenu.findFirst({
      where: { name, location },
    });
    if (existing) {
      return conflict(`A menu named "${name}" already exists for this location`);
    }

    const menu = await prisma.navigationMenu.create({
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

async function handleUpdateNavigation(menuId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.navigationMenu.findUnique({ where: { id: menuId } });
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
    const duplicate = await prisma.navigationMenu.findFirst({
      where: { name: newName, location: newLocation, id: { not: menuId } },
    });
    if (duplicate) {
      return conflict(`A menu named "${newName}" already exists for this location`);
    }

    const menu = await prisma.navigationMenu.update({
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

async function handleDeleteNavigation(menuId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.navigationMenu.findUnique({ where: { id: menuId } });
    if (!existing) return notFound("Navigation menu not found");

    await prisma.navigationMenu.delete({ where: { id: menuId } });
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

async function handleFooterList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const sections = await prisma.footerSection.findMany({
      orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateFooter(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { column, title, contentType, content, sortOrder, isActive } = body;

  if (!title) return badRequest("Footer section title is required");

  try {
    const prisma = getPrisma(env);
    const section = await prisma.footerSection.create({
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

async function handleUpdateFooter(sectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    const fields = ["column", "title", "contentType", "content", "sortOrder", "isActive"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const section = await prisma.footerSection.update({
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

async function handleDeleteFooter(sectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.footerSection.delete({ where: { id: sectionId } });
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
