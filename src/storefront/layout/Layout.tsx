import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function parseStructuredData(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

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
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.contentRect.height);
      }
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const themeData = asRecord(settings?.theme);
    const design = asRecord(themeData.design);
    const colors = Object.keys(asRecord(design.colors)).length
      ? asRecord(design.colors)
      : asRecord(themeData.colors);
    const typography = asRecord(design.typography);
    const root = document.documentElement.style;
    if (colors.primary) root.setProperty("--color-brand", colors.primary as string);
    if (colors.accent) root.setProperty("--color-gold", colors.accent as string);
    if (colors.background) root.setProperty("--color-bg", colors.background as string);
    if (colors.text) root.setProperty("--color-text", colors.text as string);
    if (typography.displayFont) root.setProperty("--font-display", `"${typography.displayFont}", Georgia, serif`);
    if (typography.bodyFont) root.setProperty("--font-body", `"${typography.bodyFont}", Inter, sans-serif`);
    if (typography.baseSize) root.fontSize = typography.baseSize as string;
  }, [settings?.theme]);

  const theme = asRecord(settings?.theme);
  const branding = asRecord(theme.branding);
  const seo = asRecord(settings?.seo);
  const siteName = settings?.siteName || branding.brandName as string || "নবME";
  const siteTitle = (seo.globalMetaTitle as string) || `${siteName} — Premium Fashion`;
  const siteDescription = (seo.globalMetaDescription as string) || "Premium fashion destination celebrating the intersection of traditional craftsmanship and contemporary design.";
  const ogImage = (seo.ogImage as string) || settings?.ogImageUrl || ogImageFallback();
  const faviconUrl = settings?.faviconUrl || branding.favicon as string || "";
  const configuredCanonical = typeof seo.canonicalUrl === "string" ? seo.canonicalUrl.replace(/\/+$/, "") : "";
  const customSchema = parseStructuredData(seo.structuredData);
  const customCss = typeof theme.customCSS === "string" ? theme.customCSS : "";
  const facebookPixelId = seo.facebookPixelId as string | undefined;
  const googleTagManagerId = seo.googleTagManagerId as string | undefined;

  const currentUrl = configuredCanonical
    ? `${configuredCanonical}${pathname === "/" ? "" : pathname}`
    : canonical(pathname);
  const ws = useMemo(() => websiteSchema(), []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTopOnNavigate />
      <Helmet>
        <html lang="en" />
        <meta name="description" content={siteDescription} />
        <link rel="canonical" href={currentUrl} />
        <link rel="icon" type={faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/svg+xml"} href={faviconUrl || "/favicon.svg"} />
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
        {customSchema && <script type="application/ld+json">{JSON.stringify(customSchema)}</script>}
        {facebookPixelId && (
          <script>
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${facebookPixelId}');fbq('track', 'PageView');`}
          </script>
        )}
        {facebookPixelId && <noscript><img height="1" width="1" style={{display:'none'}} src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`} /></noscript>}
        {googleTagManagerId && (
          <script>
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');`}
          </script>
        )}
        {customCss && <style>{customCss}</style>}
        <style>{`
          body { background-color: var(--color-bg, #fff); color: var(--color-text, #262626); font-family: var(--font-body); }
          .font-display { font-family: var(--font-display); }
          .text-brand-500, .hover\\:text-brand-500:hover { color: var(--color-brand); }
          .bg-brand-500 { background-color: var(--color-brand); }
          .border-brand-500 { border-color: var(--color-brand); }
          .text-accent-gold, .text-accent-goldLight { color: var(--color-gold); }
          .bg-accent-gold { background-color: var(--color-gold); }
        `}</style>
      </Helmet>
      <div ref={headerRef}>
        <Header />
      </div>
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-500 focus:text-white focus:px-4 focus:py-2 focus:rounded">
        Skip to content
      </a>
      <main id="main-content" className="flex-1 pb-16 md:pb-0" style={{ paddingTop: `${headerHeight}px` }}>
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
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      {!isCheckout && <SocialProof />}
      {!isCheckout && <BottomNav />}
      <ScrollToTop />
      <Footer />
    </div>
  );
}
