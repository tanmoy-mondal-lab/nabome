import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleSettingsRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "public":
      return handlePublic(ctx.env);
    case "homepage":
      return handleHomepage(ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

async function handleHomepage(env: any): Promise<Response> {
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

async function handlePublic(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const [settings, socialLinks] = await Promise.all([
      prisma.siteSetting.findFirst({
        select: {
          siteName: true,
          tagline: true,
          logoUrl: true,
          faviconUrl: true,
          ogImageUrl: true,
          currency: true,
          taxRate: true,
          freeShippingThreshold: true,
          shippingInfo: true,
          returnPolicy: true,
          aboutUs: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
          theme: true,
          seo: true,
          preferences: true,
        },
      }),
      prisma.socialMediaLink.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { platform: true, label: true, url: true, icon: true },
      }),
    ]);

    if (!settings) {
      return success({
        siteName: "নবME",
        tagline: "Premium Fashion Destination",
        currency: "INR",
        socialLinks,
        theme: null,
      });
    }

    return success({ ...settings, socialLinks });
  } catch (err) {
    return serverError(err);
  }
}
