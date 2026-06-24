import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleCMSRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "homepage":
      return handleHomepage(ctx.env);
    case "pages":
      return handlePages(ctx.env);
    case "page":
      return handlePage(params[0], ctx.env);
    case "navigation":
      return handleNavigation(ctx.env);
    case "announcements":
      return handleAnnouncements(ctx.env);
    case "brandStory":
      return handleBrandStory(ctx.env);
    case "footer":
      return handleFooter(ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

env: anyasync function handleHomepage(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const sections = await prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

env: anyasync function handlePages(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const pages = await prisma.staticPage.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDesc: true,
        publishedAt: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });
    return success({ pages });
  } catch (err) {
    return serverError(err);
  }
}

async function handlePage(slug: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const page = await prisma.staticPage.findFirst({
      where: { slug, isPublished: true },
    });
    if (!page) return notFound("Page not found");
    return success({ page });
  } catch (err) {
    return serverError(err);
  }
}

env: anyasync function handleNavigation(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const menus = await prisma.navigationMenu.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return success({ menus });
  } catch (err) {
    return serverError(err);
  }
}

env: anyasync function handleAnnouncements(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const now = new Date();
    const announcements = await prisma.announcementBar.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return success({ announcements });
  } catch (err) {
    return serverError(err);
  }
}

env: anyasync function handleBrandStory(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const story = await prisma.brandStory.findFirst();
    if (!story) return notFound("Brand story not found");
    return success({ story });
  } catch (err) {
    return serverError(err);
  }
}

env: anyasync function handleFooter(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const sections = await prisma.footerSection.findMany({
      where: { isActive: true },
      orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}
