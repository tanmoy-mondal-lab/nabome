import { getPrisma } from "./_lib/prisma";
import type { Env } from "./_lib/env";

const DEFAULT_SITE_URL = "https://www.nabome.online";

function defaultRobots(siteUrl: string): string {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /auth/",
    "Disallow: /account/",
    "Disallow: /api/",
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join("\n");
}

export async function GET(_req: Request, opts?: { env?: Env }): Promise<Response> {
  const env = opts?.env;
  let siteUrl = (env?.SITE_URL || env?.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
  let content = "";

  try {
    const settings = await getPrisma(env).siteSetting.findFirst({
      select: { seo: true },
    });
    const seo = settings?.seo && typeof settings.seo === "object"
      ? settings.seo as Record<string, unknown>
      : {};
    if (typeof seo.canonicalUrl === "string" && seo.canonicalUrl.trim()) {
      siteUrl = seo.canonicalUrl.trim().replace(/\/+$/, "");
    }
    if (typeof seo.robotsTxt === "string") {
      content = seo.robotsTxt.trim();
    }
  } catch (error) {
    console.error("[ROBOTS] Falling back to defaults:", error);
  }

  return new Response(`${content || defaultRobots(siteUrl)}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
