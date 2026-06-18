import { prisma } from "../_lib/prisma";
import { success, notFound, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleCMSRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "homepage":
      return handleHomepage();
    case "pages":
      return handlePages();
    case "page":
      return handlePage(params[0]);
    case "navigation":
      return handleNavigation();
    case "announcements":
      return handleAnnouncements();
    case "brandStory":
      return handleBrandStory();
    case "footer":
      return handleFooter();
    default:
      return new Response("Unknown action", { status: 400 });
  }
}

async function handleHomepage(): Promise<Response> {
  try {
    const sections = await prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

async function handlePages(): Promise<Response> {
  try {
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

async function handlePage(slug: string): Promise<Response> {
  try {
    const page = await prisma.staticPage.findFirst({
      where: { slug, isPublished: true },
    });
    if (!page) return notFound("Page not found");
    return success({ page });
  } catch (err) {
    return serverError(err);
  }
}

async function handleNavigation(): Promise<Response> {
  try {
    const menus = await prisma.navigationMenu.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return success({ menus });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAnnouncements(): Promise<Response> {
  try {
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

async function handleBrandStory(): Promise<Response> {
  try {
    const story = await prisma.brandStory.findFirst();
    if (!story) return notFound("Brand story not found");
    return success({ story });
  } catch (err) {
    return serverError(err);
  }
}

async function handleFooter(): Promise<Response> {
  try {
    const sections = await prisma.footerSection.findMany({
      where: { isActive: true },
      orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}
