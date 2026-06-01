import { useEffect } from "react";

type SEOProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "product" | "article";
  structuredData?: Record<string, unknown>;
  keywords?: string;
};

const siteUrl = "https://www.nabome.online";
const defaultImage = `${siteUrl}/images/products/product1.jpeg`;

function setMeta(name: string, content: string, property = false) {
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
}: SEOProps) {
  useEffect(() => {
    const canonical = `${siteUrl}${path}`;
    document.title = title;
    setMeta("description", description);
    setMeta("robots", "index, follow");
    setMeta("theme-color", "#050505");
    setMeta("og:site_name", "নবME", true);
    setMeta("og:locale", "en_IN", true);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type === "product" ? "product" : "website", true);
    setMeta("og:url", canonical, true);
    setMeta("og:image", image.startsWith("http") ? image : `${siteUrl}${image}`, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", "@nabome_online");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image.startsWith("http") ? image : `${siteUrl}${image}`);
    if (keywords) setMeta("keywords", keywords);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;

    const id = "nabome-structured-data";
    document.getElementById(id)?.remove();
    if (structuredData) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [description, image, keywords, path, structuredData, title, type]);

  return null;
}
