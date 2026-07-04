import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api/client";
import { useSettings } from "../hooks/useSettings";
import SectionRenderer from "../sections/SectionRenderer";
import { RecentlyViewed } from "../components/RecentlyViewed";
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
  const siteName = typeof settings.siteName === "string" && settings.siteName.trim()
    ? settings.siteName
    : "নবME";

  const { data: homepageRes, isLoading: loading, error: homepageError } = useQuery({
    queryKey: ["homepage"],
    queryFn: () => api.get<{ sections: SectionData[] }>("/api/homepage"),
    staleTime: 1000 * 60 * 10,
  });

  const sections = homepageRes?.sections ?? [];

  useEffect(() => {
    document.title = `${siteName} — Premium Fashion`;
  }, [siteName]);

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
      <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.96),rgba(15,15,15,0.98))]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-24 md:px-10 lg:px-12">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <p className="mb-4 text-[10px] uppercase tracking-[0.45em] text-accent-goldLight">
                {siteName} / live edit
              </p>
              <h1 className="font-display text-5xl leading-none text-white md:text-7xl lg:text-8xl">
                The storefront is ready.
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-300 md:text-lg">
                The homepage feed is temporarily unavailable on this deployment, but the rest of the store is open.
                Continue into the catalog, explore lookbooks, or check back once the homepage data reconnects.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                  Shop Products
                </Link>
                <Link to="/collections" className="btn-secondary inline-flex items-center gap-2">
                  View Collections
                </Link>
                <Link to="/lookbooks" className="text-xs uppercase tracking-[0.35em] text-neutral-300 hover:text-white transition-colors">
                  Browse Lookbooks
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm md:p-6">
              <div className="aspect-[4/5] rounded-[1.5rem] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 md:p-8">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-400">
                      Catalog access
                    </p>
                    <p className="mt-4 max-w-xs font-display text-3xl leading-tight text-white md:text-4xl">
                      Curated pieces, ready to shop.
                    </p>
                  </div>
                  <div className="grid gap-3 text-sm text-neutral-300">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span>Mobile-first navigation</span>
                      <span className="text-accent-goldLight">Live</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span>Desktop storefront</span>
                      <span className="text-accent-goldLight">Responsive</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Content fallback</span>
                      <span className="text-accent-goldLight">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      <section className="py-16 md:py-24 bg-luxe-ivory">
        <div className="container-page">
          <RecentlyViewed />
        </div>
      </section>
    </>
  );
}
