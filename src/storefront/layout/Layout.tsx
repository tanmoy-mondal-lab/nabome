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
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [theme, setTheme] = useState<Record<string, unknown> | null>(null);
  const isCheckout = pathname === "/checkout";

  useEffect(() => {
    api.get("/api/settings", { params: { action: "public" } })
      .then((res) => {
        const r = res as Record<string, unknown>;
        setSettings(r);
        const t = r.theme as Record<string, unknown> ?? null;
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

    const onSettingsUpdate = () => {
      api.get("/api/settings", { params: { action: "public" } })
        .then((res) => {
          const r = res as Record<string, unknown>;
          setSettings(r);
          const t = r.theme as Record<string, unknown> ?? null;
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
    };
    window.addEventListener("settings:updated", onSettingsUpdate);
    return () => window.removeEventListener("settings:updated", onSettingsUpdate);
  }, []);

  const siteName = (settings?.siteName as string) || "নবME";
  const seo = (settings?.seo as Record<string, unknown>) || {};
  const siteTitle = (seo.metaTitle as string) || `${siteName} — Premium Fashion`;
  const siteDescription = (seo.metaDesc as string) || "Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.";
  const ogImage = (settings?.ogImageUrl as string) || "https://www.nabome.online/og-image.svg";
  const faviconUrl = (settings?.faviconUrl as string) || "";

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
        <Outlet />
      </main>
      {!isCheckout && <SocialProof />}
      {!isCheckout && <BottomNav />}
      <Footer />
    </div>
  );
}
