import { prisma } from "../_lib/prisma";
import { success, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleSettingsRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "public":
      return handlePublic();
    default:
      return new Response("Unknown action", { status: 400 });
  }
}

async function handlePublic(): Promise<Response> {
  try {
    const [settings, socialLinks] = await Promise.all([
      prisma.siteSetting.findFirst({
        select: {
          siteName: true,
          tagline: true,
          logoUrl: true,
          faviconUrl: true,
          ogImageUrl: true,
          currency: true,
          freeShippingThreshold: true,
          shippingInfo: true,
          returnPolicy: true,
          aboutUs: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
          theme: true,
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
        siteName: "NABOME",
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
