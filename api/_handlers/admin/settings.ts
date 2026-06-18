import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";

export async function handleAdminSettingsRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "get":
      return handleGet();
    case "update":
      return handleUpdate(req);
    case "socialLinks":
      return handleSocialLinksList();
    case "createSocialLink":
      return handleCreateSocialLink(req);
    case "updateSocialLink":
      return handleUpdateSocialLink(params[0], req);
    case "deleteSocialLink":
      return handleDeleteSocialLink(params[0]);
    default:
      return badRequest("Unknown action");
  }
}

async function handleGet(): Promise<Response> {
  try {
    const settings = await prisma.siteSetting.findFirst();
    return success({ settings });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(req: Request): Promise<Response> {
  const body = await req.json();

  try {
    const existing = await prisma.siteSetting.findFirst();

    const data: Record<string, unknown> = {};
    const fields = [
      "siteName", "tagline", "logoUrl", "faviconUrl", "ogImageUrl",
      "currency", "taxRate", "freeShippingThreshold",
      "shippingInfo", "returnPolicy", "aboutUs",
      "contactEmail", "contactPhone", "address",
      "googleAnalyticsId", "facebookPixelId",
      "theme",
    ];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    let settings;
    if (existing) {
      settings = await prisma.siteSetting.update({
        where: { id: existing.id },
        data: data as never,
      });
    } else {
      const createData = { siteName: body.siteName ?? "NABOME", ...data } as never;
      settings = await prisma.siteSetting.create({ data: createData });
    }

    return success(settings);
  } catch (err) {
    return serverError(err);
  }
}

async function handleSocialLinksList(): Promise<Response> {
  try {
    const links = await prisma.socialMediaLink.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return success({ links });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateSocialLink(req: Request): Promise<Response> {
  const body = await req.json();
  const { platform, url, label, icon, isActive, sortOrder } = body;

  if (!platform || !url) return badRequest("Platform and URL are required");

  try {
    const link = await prisma.socialMediaLink.create({
      data: {
        platform,
        url,
        label: label ?? null,
        icon: icon ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    return created(link);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateSocialLink(linkId: string, req: Request): Promise<Response> {
  const body = await req.json();

  try {
    const data: Record<string, unknown> = {};
    const fields = ["platform", "url", "label", "icon", "isActive", "sortOrder"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const link = await prisma.socialMediaLink.update({
      where: { id: linkId },
      data: data as never,
    });
    return success(link);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDeleteSocialLink(linkId: string): Promise<Response> {
  try {
    await prisma.socialMediaLink.delete({ where: { id: linkId } });
    return success({ message: "Social link deleted" });
  } catch (err) {
    return notFound("Link not found");
  }
}
