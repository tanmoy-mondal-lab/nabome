import { Helmet } from "react-helmet-async";
import { canonical, metaDescription } from "../lib/seo";

const SITE_NAME = "নবME";
const DEFAULT_OG_IMAGE = "/og-image.svg";

interface SEOMeta {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "product" | "article";
  noindex?: boolean;
  nofollow?: boolean;
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: Record<string, unknown>[];
}

export function SEOHead({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = "website",
  noindex = false,
  nofollow = false,
  locale = "en_IN",
  publishedTime,
  modifiedTime,
  jsonLd,
}: SEOMeta) {
  const fullTitle = title.includes("—") ? title : `${title} — ${SITE_NAME}`;
  const desc = metaDescription(description, 160);
  const url = canonicalUrl ? canonical(canonicalUrl) : undefined;
  const image = ogImage ? (ogImage.startsWith("http") ? ogImage : canonical(ogImage)) : canonical(DEFAULT_OG_IMAGE);
  const robots = noindex && nofollow ? "noindex, nofollow" : noindex ? "noindex, follow" : nofollow ? "index, nofollow" : "index, follow";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {url && <link rel="canonical" href={url} />}
      <meta name="robots" content={robots} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={ogType} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={locale} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {jsonLd?.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  );
}
