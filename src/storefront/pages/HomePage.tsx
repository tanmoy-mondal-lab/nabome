import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { useSettings } from "../hooks/useSettings";
import SectionRenderer from "../sections/SectionRenderer";
import { canonical } from "../../lib/seo";
import { formatPrice } from "../../lib/utils/format";

interface SectionData {
  id: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

export default function HomePage() {
  const { data: settingsData } = useSettings();
  const settings = (settingsData as unknown as Record<string, unknown>) ?? {};

  const { data: homepageRes, isLoading: loading, error: homepageError } = useQuery({
    queryKey: ["homepage"],
    queryFn: () => api.get<{ sections: SectionData[] }>("/api/homepage"),
    staleTime: 1000 * 60 * 10,
  });

  const sections = homepageRes?.sections ?? [];

  useEffect(() => {
    document.title = `${(settings.siteName as string) || "নবME"} — Premium Fashion`;
  }, [settings.siteName]);

  if (!loading && !homepageError && sections.length === 0) {
    return (
      <div className="relative h-screen min-h-[700px] bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-400 mb-4">Welcome to নবME</p>
          <p className="text-xs text-neutral-500">Content is being prepared. Check back soon.</p>
        </div>
      </div>
    );
  }

  const hasTrustBar = sections.some((s) => s.sectionType === "trust_bar");

  if (loading) {
    return (
      <div className="relative h-screen min-h-[700px] bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (homepageError) {
    return (
      <div className="relative h-screen min-h-[700px] bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-400 mb-4">Failed to load homepage.</p>
          <button onClick={() => window.location.reload()} className="text-xs text-accent-gold hover:underline uppercase tracking-widest">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="description" content={(settings.siteDescription as string) || "Discover premium fashion at নবME"} />
        <link rel="canonical" href={canonical("/")} />
        {/* websiteSchema is already injected in Layout — no duplicate needed */}
        <meta property="og:title" content={`${(settings.siteName as string) || "নবME"} — Premium Fashion`} />
        <meta property="og:description" content={(settings.siteDescription as string) || ""} />
        {typeof settings.siteLogo === "string" && settings.siteLogo && <meta property="og:image" content={settings.siteLogo} />}
      </Helmet>

      {!hasTrustBar && (
        <div className="bg-neutral-950 text-white text-center py-2 text-xs tracking-widest uppercase">
          Free shipping on orders above {formatPrice(Number((settings.preferences as Record<string, unknown>)?.freeShippingThreshold ?? 500))}
        </div>
      )}

      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
