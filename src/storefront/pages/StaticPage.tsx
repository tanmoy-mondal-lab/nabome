import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { canonical } from "../../lib/seo";
import { api } from "../../lib/api/client";
import SectionRenderer from "../sections/SectionRenderer";

interface StaticPageData {
  id: string;
  title: string;
  slug: string;
  content?: unknown;
  metaTitle?: string;
  metaDesc?: string;
  publishedAt?: string;
}

interface CmsSection {
  id: string;
  type: string;
  config: Record<string, unknown>;
  visibility?: { isVisible?: boolean };
}

const SLUG_TO_BREADCRUMB: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  faq: "FAQ",
  "shipping-returns": "Shipping & Returns",
  about: "About Us",
  contact: "Contact Us",
};

function parseSections(content: unknown): { sections: CmsSection[] } | null {
  if (!content) return null;
  const raw = typeof content === "string" ? content : null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sections)) return parsed;
      return null;
    } catch {
      return null;
    }
  }
  if (typeof content === "object" && content !== null) {
    const obj = content as Record<string, unknown>;
    if (Array.isArray(obj.sections)) return obj as { sections: CmsSection[] };
  }
  return null;
}

function isRawHtml(content: unknown): boolean {
  if (typeof content !== "string" || !content) return false;
  return /^<[^>]+>/.test(content.trim());
}

export function StaticPage() {
  const { slug: paramsSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const slug = paramsSlug || location.pathname.replace(/^\//, "").split("/")[0];

  const { data, isLoading, error } = useQuery<StaticPageData>({
    queryKey: ["cms", "page", slug],
    queryFn: async () => {
      const res = await api.get<{ page: StaticPageData }>(`/api/cms/pages/${slug}`);
      return res.page;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container-page section-padding">
        <div className="max-w-3xl">
          <h1 className="font-display text-display-3 text-neutral-900 mb-6">Page Not Found</h1>
          <p className="text-body-base text-neutral-600">The page you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const breadcrumbLabel = SLUG_TO_BREADCRUMB[slug ?? ""] ?? data.title;
  const parsed = parseSections(data.content);
  const contentString = typeof data.content === "string" ? data.content : "";
  const isHtml = !parsed && isRawHtml(contentString);

  return (
    <div>
      <Helmet>
        <title>{data.metaTitle || `${data.title} — নবME`}</title>
        {data.metaDesc && <meta name="description" content={data.metaDesc} />}
        <link rel="canonical" href={canonical(`/${data.slug}`)} />
      </Helmet>
      {parsed ? (
        <div>
          {parsed.sections
            .filter((s) => s.visibility?.isVisible !== false)
            .map((s) => (
              <SectionRenderer
                key={s.id}
                section={{
                  id: s.id,
                  sectionType: s.type,
                  title: (s.config?.heading as string) ?? null,
                  subtitle: (s.config?.subheading as string) ?? null,
                  content: s.config,
                }}
              />
            ))}
        </div>
      ) : (
        <div className="container-page section-padding">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: breadcrumbLabel }]}
            className="mb-8"
          />
          <div className="max-w-3xl">
            <h1 className="font-display text-display-3 text-neutral-900 mb-6">{data.title}</h1>
            {isHtml ? (
              <div
                className="prose prose-neutral space-y-6 text-body-base text-neutral-600 font-editorial leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentString }}
              />
            ) : (
              <p className="text-body-base text-neutral-600">{contentString}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StaticPage;
