import { useEffect, useRef } from "react";
import { organizationSchema, websiteSchema } from "../lib/structured-data";

type SEOProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "product" | "article";
  structuredData?: Record<string, unknown>;
  keywords?: string;
  noindex?: boolean;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  alternateLocales?: { lang: string; url: string }[];
};

const siteUrl = "https://www.nabome.online";
const defaultImage = `${siteUrl}/images/logo/logo.webp`;

function setMeta(name: string, content: string, property = false) {
  if (!content) return;
  const attr = property ? "property" : "name";
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

export default function SEO({
  title,
  description,
  path = "/",
  image = defaultImage,
  type = "website",
  structuredData,
  keywords,
  noindex,
  locale = "en_IN",
  publishedTime,
  modifiedTime,
  alternateLocales,
}: SEOProps) {
  const injected = useRef(false);

  useEffect(() => {
    const canonical = `${siteUrl}${path}`;
    document.title = title;
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("theme-color", "#050505");
    setMeta("og:site_name", "নবME", true);
    setMeta("og:locale", locale, true);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type === "product" ? "product" : type === "article" ? "article" : "website", true);
    setMeta("og:url", canonical, true);
    setMeta("og:image", image.startsWith("http") ? image : `${siteUrl}${image}`, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", "@nabome_online");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image.startsWith("http") ? image : `${siteUrl}${image}`);
    if (keywords) setMeta("keywords", keywords);
    if (publishedTime) setMeta("article:published_time", publishedTime, true);
    if (modifiedTime) setMeta("article:modified_time", modifiedTime, true);

    // Canonical URL
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;

    // Alternate hreflang links
    document.querySelectorAll('link[rel="alternate"]').forEach((el) => el.remove());
    if (alternateLocales) {
      for (const alt of alternateLocales) {
        const altLink = document.createElement("link");
        altLink.rel = "alternate";
        altLink.hreflang = alt.lang;
        altLink.href = alt.url;
        document.head.appendChild(altLink);
      }
    }

    // Structured data
    const id = "nabome-structured-data";
    document.getElementById(id)?.remove();
    const schemas: Record<string, unknown>[] = [];

    if (structuredData) {
      schemas.push(structuredData);
    }

    // Inject base schemas only once
    if (!injected.current) {
      schemas.push(organizationSchema());
      schemas.push(websiteSchema());
      injected.current = true;
    }

    if (schemas.length > 0) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.text = schemas.length === 1
        ? JSON.stringify(schemas[0])
        : JSON.stringify(schemas.map((s) => ({ ...s, "@context": "https://schema.org" })));
      document.head.appendChild(script);
    }
  }, [description, image, keywords, path, structuredData, title, type, noindex, locale, publishedTime, modifiedTime, alternateLocales]);

  return null;
}
