import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";

export async function handleAdminCMSRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "pages":
      return handlePagesList();
    case "createPage":
      return handleCreatePage(req);
    case "updatePage":
      return handleUpdatePage(params[0], req);
    case "deletePage":
      return handleDeletePage(params[0]);
    case "homepage":
      return handleHomepageList();
    case "createHomeSection":
      return handleCreateHomeSection(req);
    case "updateHomeSection":
      return handleUpdateHomeSection(params[0], req);
    case "deleteHomeSection":
      return handleDeleteHomeSection(params[0]);
    case "reorderHomeSections":
      return handleReorderHomeSections(req);
    case "navigation":
      return handleNavigationList();
    case "createNavigation":
      return handleCreateNavigation(req);
    case "updateNavigation":
      return handleUpdateNavigation(params[0], req);
    case "deleteNavigation":
      return handleDeleteNavigation(params[0]);
    case "brandStory":
      return handleGetBrandStory();
    case "updateBrandStory":
      return handleUpdateBrandStory(req);
    case "footer":
      return handleFooterList();
    case "createFooter":
      return handleCreateFooter(req);
    case "updateFooter":
      return handleUpdateFooter(params[0], req);
    case "deleteFooter":
      return handleDeleteFooter(params[0]);
    default:
      return badRequest("Unknown action");
  }
}

// ─── Static Pages ───

async function handlePagesList(): Promise<Response> {
  try {
    const pages = await prisma.staticPage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return success({ pages });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreatePage(req: Request): Promise<Response> {
  const body = await req.json();
  const { title, content, template, isPublished, metaTitle, metaDesc, ogImage } = body;

  if (!title) return badRequest("Page title is required");

  const slug = slugify(title);
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
    return created(page);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdatePage(pageId: string, req: Request): Promise<Response> {
  const body = await req.json();
  try {
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
    return success(page);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeletePage(pageId: string): Promise<Response> {
  try {
    await prisma.staticPage.delete({ where: { id: pageId } });
    return success({ message: "Page deleted" });
  } catch (err) {
    return notFound("Page not found");
  }
}

// ─── Homepage Sections ───

async function handleHomepageList(): Promise<Response> {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateHomeSection(req: Request): Promise<Response> {
  const body = await req.json();
  const { sectionType, title, subtitle, content, sortOrder, isActive, visibility } = body;

  if (!sectionType) return badRequest("Section type is required");

  try {
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
    return created(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateHomeSection(sectionId: string, req: Request): Promise<Response> {
  const body = await req.json();
  try {
    const data: Record<string, unknown> = {};
    const fields = ["sectionType", "title", "subtitle", "content", "sortOrder", "isActive", "visibility"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const section = await prisma.homepageSection.update({
      where: { id: sectionId },
      data: data as never,
    });
    return success(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteHomeSection(sectionId: string): Promise<Response> {
  try {
    await prisma.homepageSection.delete({ where: { id: sectionId } });
    return success({ message: "Section deleted" });
  } catch (err) {
    return notFound("Section not found");
  }
}

async function handleReorderHomeSections(req: Request): Promise<Response> {
  const body = await req.json();
  const { order } = body;

  if (!Array.isArray(order)) return badRequest("Order array is required");

  try {
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

async function handleNavigationList(): Promise<Response> {
  try {
    const menus = await prisma.navigationMenu.findMany({
      orderBy: { createdAt: "asc" },
    });
    return success({ menus });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateNavigation(req: Request): Promise<Response> {
  const body = await req.json();
  const { name, location, items, isActive } = body;

  if (!name || !location || !items) {
    return badRequest("Name, location, and items are required");
  }

  try {
    const menu = await prisma.navigationMenu.create({
      data: {
        name,
        location,
        items,
        isActive: isActive ?? true,
      },
    });
    return created(menu);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateNavigation(menuId: string, req: Request): Promise<Response> {
  const body = await req.json();
  try {
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.location !== undefined) data.location = body.location;
    if (body.items !== undefined) data.items = body.items;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const menu = await prisma.navigationMenu.update({
      where: { id: menuId },
      data: data as never,
    });
    return success(menu);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteNavigation(menuId: string): Promise<Response> {
  try {
    await prisma.navigationMenu.delete({ where: { id: menuId } });
    return success({ message: "Menu deleted" });
  } catch (err) {
    return notFound("Menu not found");
  }
}

// ─── Brand Story ───

async function handleGetBrandStory(): Promise<Response> {
  try {
    const story = await prisma.brandStory.findFirst();
    return success({ story: story ?? null });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateBrandStory(req: Request): Promise<Response> {
  const body = await req.json();
  const { title, subtitle, heroImageUrl, content, mission, vision, values } = body;

  try {
    const existing = await prisma.brandStory.findFirst();
    if (existing) {
      const story = await prisma.brandStory.update({
        where: { id: existing.id },
        data: {
          title: title ?? existing.title,
          subtitle: subtitle ?? existing.subtitle,
          heroImageUrl: heroImageUrl ?? existing.heroImageUrl,
          content: content ?? existing.content,
          mission: mission ?? existing.mission,
          vision: vision ?? existing.vision,
          values: values ?? existing.values,
        },
      });
      return success(story);
    } else {
      const story = await prisma.brandStory.create({
        data: {
          title: title ?? "Our Story",
          subtitle: subtitle ?? null,
          heroImageUrl: heroImageUrl ?? null,
          content: content ?? null,
          mission: mission ?? null,
          vision: vision ?? null,
          values: values ?? null,
        },
      });
      return created(story);
    }
  } catch (err) {
    return serverError(err);
  }
}

// ─── Footer Sections ───

async function handleFooterList(): Promise<Response> {
  try {
    const sections = await prisma.footerSection.findMany({
      orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateFooter(req: Request): Promise<Response> {
  const body = await req.json();
  const { column, title, contentType, content, sortOrder, isActive } = body;

  if (!title) return badRequest("Footer section title is required");

  try {
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
    return created(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateFooter(sectionId: string, req: Request): Promise<Response> {
  const body = await req.json();
  try {
    const data: Record<string, unknown> = {};
    const fields = ["column", "title", "contentType", "content", "sortOrder", "isActive"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const section = await prisma.footerSection.update({
      where: { id: sectionId },
      data: data as never,
    });
    return success(section);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteFooter(sectionId: string): Promise<Response> {
  try {
    await prisma.footerSection.delete({ where: { id: sectionId } });
    return success({ message: "Footer section deleted" });
  } catch (err) {
    return notFound("Section not found");
  }
}
