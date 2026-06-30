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
      return handleNavigation(req, ctx.env);
    case "announcements":
      return handleAnnouncements(ctx.env);
    case "footer":
      return handleFooter(ctx.env);
    case "socialProof":
      return handleSocialProof(ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

export async function handleHomepage(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const now = new Date();
    const sections = await prisma.homepageSection.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
          { OR: [{ expireAt: null }, { expireAt: { gte: now } }] },
        ],
      },
      orderBy: { sortOrder: "asc" },
    });
    return success({ sections });
  } catch (err) {
    return serverError(err);
  }
}

async function handlePages(env: any): Promise<Response> {
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

async function handleNavigation(req: Request, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const url = new URL(req.url);
    const location = url.searchParams.get("location");
    const where: Record<string, unknown> = { isActive: true };
    if (location && ["header", "footer", "mobile", "sidebar"].includes(location)) {
      where.location = location;
    }
    const menus = await prisma.navigationMenu.findMany({
      where: where as never,
      orderBy: { createdAt: "asc" },
    });
    return success({ menus });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAnnouncements(env: any): Promise<Response> {
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

async function handleFooter(env: any): Promise<Response> {
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

async function handleSocialProof(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const recentOrders = await prisma.order.findMany({
      where: { paymentStatus: "paid" },
      select: {
        id: true,
        createdAt: true,
        shippingAddress: {
          select: { city: true },
        },
        items: {
          select: { productName: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const proof = recentOrders
      .filter((o) => o.items.length > 0 && o.items[0].productName)
      .map((o) => ({
        product: o.items[0].productName,
        city: o.shippingAddress?.city ?? "India",
        timestamp: o.createdAt,
      }))
      .slice(0, 10);

    return success({ proof });
  } catch (err) {
    return serverError(err);
  }
}
