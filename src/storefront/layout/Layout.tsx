import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useReducedMotion } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { BottomNav } from "./BottomNav";
import { SearchOverlay } from "./SearchOverlay";
import { CartDrawer } from "../components/CartDrawer";
import { SocialProof } from "../components/SocialProof";
import { ScrollToTop } from "../components/ScrollToTop";
import { useSettings } from "../hooks/useSettings";
import { canonical, ogImageFallback, websiteSchema } from "../../lib/seo";
import { ErrorBoundary } from "../../components/ErrorBoundary";

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function StorefrontLayout() {
  const { pathname } = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { data: settings } = useSettings();
  const isCheckout = pathname === "/checkout";

  useEffect(() => {
    const themeData = settings?.theme;
    if (!themeData) return;
    const design = (themeData.design ?? {}) as Record<string, unknown>;
    const colors = (design.colors ?? {}) as Record<string, unknown>;
    const root = document.documentElement.style;
    if (colors.primary) root.setProperty("--color-primary", colors.primary as string);
    if (colors.accent) root.setProperty("--color-accent", colors.accent as string);
    if (colors.background) root.setProperty("--color-bg", colors.background as string);
    if (colors.text) root.setProperty("--color-text", colors.text as string);
  }, [settings?.theme]);

  const siteName = settings?.siteName || "নবME";
  const seo = settings?.seo || {};
  const siteTitle = (seo.metaTitle as string) || `${siteName} — Premium Fashion`;
  const siteDescription = (seo.metaDesc as string) || "Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.";
  const ogImage = settings?.ogImageUrl || ogImageFallback();
  const faviconUrl = settings?.faviconUrl || "";

  const currentUrl = canonical(pathname);
  const ws = websiteSchema();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTopOnNavigate />
      <Helmet>
        <html lang="en" />
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
        <meta property="og:locale" content={(settings?.preferences as Record<string, unknown>)?.locale as string || "en_IN"} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={ogImage} />

        <script type="application/ld+json">{JSON.stringify(ws)}</script>
      </Helmet>
      <Header />
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-500 focus:text-white focus:px-4 focus:py-2 focus:rounded">
        Skip to content
      </a>
      <main id="main-content" className="flex-1 pt-[64px] md:pt-[80px] pb-16 md:pb-0">
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
          <motion.div
            key={pathname}
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </ErrorBoundary>
      </main>
      {!isCheckout && <SocialProof />}
      {!isCheckout && <BottomNav />}
      <ScrollToTop />
      <Footer />
    </div>
  );
}
