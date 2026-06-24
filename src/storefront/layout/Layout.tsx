import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { BottomNav } from "./BottomNav";
import { SearchOverlay } from "./SearchOverlay";
import { SocialProof } from "../components/SocialProof";
import { useSettings } from "../hooks/useSettings";
import { canonical, websiteSchema } from "../../lib/seo";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export function StorefrontLayout() {
  const { pathname } = useLocation();
  const { data: settings } = useSettings();
  const isCheckout = pathname === "/checkout";

  useEffect(() => {
    if (settings?.theme) {
      const d = (settings.theme.design as Record<string, unknown>) ?? {};
      const c = (d.colors as Record<string, unknown>) ?? {};
      const root = document.documentElement.style;
      if (c.primary) root.setProperty("--color-primary", c.primary as string);
      if (c.accent) root.setProperty("--color-accent", c.accent as string);
      if (c.background) root.setProperty("--color-bg", c.background as string);
      if (c.text) root.setProperty("--color-text", c.text as string);
    }
  }, [settings?.theme]);

  const siteName = settings?.siteName || "নবME";
  const seo = settings?.seo || {};
  const siteTitle = (seo.metaTitle as string) || `${siteName} — Premium Fashion`;
  const siteDescription = (seo.metaDesc as string) || "Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.";
  const ogImage = settings?.ogImageUrl || "https://www.nabome.online/og-image.svg";
  const faviconUrl = settings?.faviconUrl || "";

  const currentUrl = canonical(pathname);
  const ws = websiteSchema();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <html lang="en" />
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <link rel="canonical" href={currentUrl} />
        <link rel="icon" type={faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/svg+xml"} href={faviconUrl || "/favicon.svg"} />
        {!faviconUrl && <link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />}
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/svg+xml" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@{siteName}" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={ogImage} />

        <script type="application/ld+json">{JSON.stringify(ws)}</script>
      </Helmet>
      <Header />
      <MobileNav />
      <SearchOverlay />
      <main className="flex-1 pt-[64px] md:pt-[80px] pb-16 md:pb-0">
        <ErrorBoundary
          fallback={
            <div className="min-h-[400px] flex items-center justify-center px-4">
              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Page Error</h2>
                <p className="text-sm text-neutral-500 mb-4">This page encountered an error.</p>
                <a href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  ← Back to Home
                </a>
              </div>
            </div>
          }
        >
          <Outlet />
        </ErrorBoundary>
      </main>
      {!isCheckout && <SocialProof />}
      {!isCheckout && <BottomNav />}
      <Footer />
    </div>
  );
}
