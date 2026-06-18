import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { BottomNav } from "./BottomNav";
import { SearchOverlay } from "./SearchOverlay";
import { SocialProof } from "../components/SocialProof";
import { api } from "../../lib/api/client";
import { canonical, websiteSchema } from "../../lib/seo";

export function StorefrontLayout() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<Record<string, unknown> | null>(null);
  const isCheckout = pathname === "/checkout";

  const siteTitle = "নবME — Premium Fashion";
  const siteDescription = "Discover নবME — where heritage craftsmanship meets contemporary elegance. Premium fashion for the discerning.";

  useEffect(() => {
    api.get("/api/settings", { params: { action: "public" } })
      .then((res) => {
        const t = (res as Record<string, unknown>).theme as Record<string, unknown> ?? null;
        setTheme(t);
        if (t) {
          const d = (t.design as Record<string, unknown>) ?? {};
          const c = (d.colors as Record<string, unknown>) ?? {};
          const root = document.documentElement.style;
          if (c.primary) root.setProperty("--color-primary", c.primary as string);
          if (c.accent) root.setProperty("--color-accent", c.accent as string);
          if (c.background) root.setProperty("--color-bg", c.background as string);
          if (c.text) root.setProperty("--color-text", c.text as string);
        }
      })
      .catch(() => {});
  }, []);

  const currentUrl = canonical(pathname);
  const ws = websiteSchema();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <html lang="en" />
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <link rel="canonical" href={currentUrl} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:site_name" content="নবME" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:image" content="https://www.nabome.online/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@nabome" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content="https://www.nabome.online/og-image.jpg" />

        <script type="application/ld+json">{JSON.stringify(ws)}</script>
      </Helmet>
      <Header />
      <MobileNav />
      <SearchOverlay />
      <main className="flex-1 pt-[64px] md:pt-[80px] pb-16 md:pb-0">
        <Outlet />
      </main>
      {!isCheckout && <SocialProof />}
      {!isCheckout && <BottomNav />}
      <Footer />
    </div>
  );
}
