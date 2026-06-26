import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { requireAdmin } from "../../_lib/auth";
import { logAction, extractRequestMeta } from "../../_lib/audit";

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
    case "brandStory":
      return handleGetBrandStory(ctx.env);
    case "updateBrandStory":
      return handleUpdateBrandStory(req, ctx, ctx.env);
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

async function handleCreatePage(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { title, content, template, isPublished, metaTitle, metaDesc, ogImage } = body;

  if (!title) return badRequest("Page title is required");

  const slug = slugify(title);
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
    logAction(ctx.userId, "admin.cms.page.create", {
      entity: "staticPage",
      entityId: page.id,
      metadata: { title: page.title, slug: page.slug },
      ...extractRequestMeta(req),
    });
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
    const fields = ["title", "content", "template", "metaTitle", "metaDesc", "ogImage"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.isPublished !== undefined) {
      data.isPublished = body.isPublished;
      data.publishedAt = body.isPublished ? new Date() : null;
    }

    const page = await prisma.staticPage.update({
      where: { id: pageId },
      data: data as never,
    });
    logAction(ctx.userId, "admin.cms.page.update", {
      entity: "staticPage",
      entityId: page.id,
      metadata: { title: page.title },
      ...extractRequestMeta(req),
    });
    return success(page);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeletePage(pageId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.staticPage.delete({ where: { id: pageId } });
    logAction(ctx.userId, "admin.cms.page.delete", {
      entity: "staticPage",
      entityId: pageId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Page deleted" });
  } catch (err) {
    return notFound("Page not found");
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
  const { sectionType, title, subtitle, content, sortOrder, isActive, visibility } = body;

  if (!sectionType) return badRequest("Section type is required");

  try {
    const prisma = getPrisma(env);
    const section = await prisma.homepageSection.create({
      data: {
        sectionType,
        title: title ?? null,
        subtitle: subtitle ?? null,
        content: content ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        visibility: visibility ?? "all",
      },
    });
    logAction(ctx.userId, "admin.cms.homepage.create", {
      entity: "homepageSection",
      entityId: section.id,
      metadata: { sectionType: section.sectionType, title: section.title },
      ...extractRequestMeta(req),
    });
    return created(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateHomeSection(sectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    const fields = ["sectionType", "title", "subtitle", "content", "sortOrder", "isActive", "visibility"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const section = await prisma.homepageSection.update({
      where: { id: sectionId },
      data: data as never,
    });
    logAction(ctx.userId, "admin.cms.homepage.update", {
      entity: "homepageSection",
      entityId: section.id,
      metadata: { sectionType: section.sectionType },
      ...extractRequestMeta(req),
    });
    return success(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteHomeSection(sectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.homepageSection.delete({ where: { id: sectionId } });
    logAction(ctx.userId, "admin.cms.homepage.delete", {
      entity: "homepageSection",
      entityId: sectionId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Section deleted" });
  } catch (err) {
    return notFound("Section not found");
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

  if (!name || !location || !items) {
    return badRequest("Name, location, and items are required");
  }

  try {
    const prisma = getPrisma(env);
    const menu = await prisma.navigationMenu.create({
      data: {
        name,
        location,
        items,
        isActive: isActive ?? true,
      },
    });
    logAction(ctx.userId, "admin.cms.navigation.create", {
      entity: "navigationMenu",
      entityId: menu.id,
      metadata: { name: menu.name, location: menu.location },
      ...extractRequestMeta(req),
    });
    return created(menu);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateNavigation(menuId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.location !== undefined) data.location = body.location;
    if (body.items !== undefined) data.items = body.items;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const menu = await prisma.navigationMenu.update({
      where: { id: menuId },
      data: data as never,
    });
    logAction(ctx.userId, "admin.cms.navigation.update", {
      entity: "navigationMenu",
      entityId: menu.id,
      metadata: { name: menu.name },
      ...extractRequestMeta(req),
    });
    return success(menu);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteNavigation(menuId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.navigationMenu.delete({ where: { id: menuId } });
    logAction(ctx.userId, "admin.cms.navigation.delete", {
      entity: "navigationMenu",
      entityId: menuId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Menu deleted" });
  } catch (err) {
    return notFound("Menu not found");
  }
}

// ─── Brand Story ───

async function handleGetBrandStory(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const story = await prisma.brandStory.findFirst();
    return success({ story: story ?? null });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateBrandStory(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { title, subtitle, heroImageUrl, heroImagePublicId, videoUrl, videoPublicId, content, mission, vision, values } = body;

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.brandStory.findFirst();
    if (existing) {
      const story = await prisma.brandStory.update({
        where: { id: existing.id },
        data: {
          title: title ?? existing.title,
          subtitle: subtitle ?? existing.subtitle,
          heroImageUrl: heroImageUrl ?? existing.heroImageUrl,
          heroImagePublicId: heroImagePublicId ?? existing.heroImagePublicId,
          videoUrl: videoUrl ?? existing.videoUrl,
          videoPublicId: videoPublicId ?? existing.videoPublicId,
          content: content ?? existing.content,
          mission: mission ?? existing.mission,
          vision: vision ?? existing.vision,
          values: values ?? existing.values,
        },
      });
      logAction(ctx.userId, "admin.cms.brand_story.update", {
        entity: "brandStory",
        entityId: story.id,
        metadata: { title: story.title },
        ...extractRequestMeta(req),
      });
      return success(story);
    } else {
      const story = await prisma.brandStory.create({
        data: {
          title: title ?? "Our Story",
          subtitle: subtitle ?? null,
          heroImageUrl: heroImageUrl ?? null,
          heroImagePublicId: heroImagePublicId ?? null,
          videoUrl: videoUrl ?? null,
          videoPublicId: videoPublicId ?? null,
          content: content ?? null,
          mission: mission ?? null,
          vision: vision ?? null,
          values: values ?? null,
        },
      });
      logAction(ctx.userId, "admin.cms.brand_story.create", {
        entity: "brandStory",
        entityId: story.id,
        metadata: { title: story.title },
        ...extractRequestMeta(req),
      });
      return created(story);
    }
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
    logAction(ctx.userId, "admin.cms.footer.create", {
      entity: "footerSection",
      entityId: section.id,
      metadata: { title: section.title, column: section.column },
      ...extractRequestMeta(req),
    });
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
    logAction(ctx.userId, "admin.cms.footer.update", {
      entity: "footerSection",
      entityId: section.id,
      metadata: { title: section.title },
      ...extractRequestMeta(req),
    });
    return success(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteFooter(sectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.footerSection.delete({ where: { id: sectionId } });
    logAction(ctx.userId, "admin.cms.footer.delete", {
      entity: "footerSection",
      entityId: sectionId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Footer section deleted" });
  } catch (err) {
    return notFound("Section not found");
  }
}
