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
import { websiteSchema, organizationSchema } from "../../lib/seo";

const SITE_URL = "https://www.nabome.online";
const SITE_NAME = "নবME — Premium Fashion";
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
  const [headerHeight, setHeaderHeight] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(min-width: 768px)").matches ? 112 : 64;
    }
    return 64;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mql = window.matchMedia("(min-width: 768px)");
    function updateHeaderHeight() {
      setHeaderHeight(mql.matches ? 112 : 64);
    }
    updateHeaderHeight();
    mql.addEventListener("change", updateHeaderHeight);
    return () => mql.removeEventListener("change", updateHeaderHeight);
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
    if (colors.surface) root.setProperty("--color-surface", colors.surface as string);
    if (colors.muted) root.setProperty("--color-muted", colors.muted as string);
    if (typography.displayFont) root.setProperty("--font-display", `"${typography.displayFont}", Georgia, serif`);
    if (typography.bodyFont) root.setProperty("--font-body", `"${typography.bodyFont}", Inter, sans-serif`);
    if (typography.baseSize) root.fontSize = typography.baseSize as string;
  }, [settings?.theme]);

  const theme = asRecord(settings?.theme);
  const branding = asRecord(theme.branding);
  const seo = asRecord(settings?.seo);
  const faviconUrl = settings?.faviconUrl || branding.favicon as string || "";
  const customSchema = parseStructuredData(seo.structuredData);
  const customCss = typeof theme.customCSS === "string" ? theme.customCSS : "";
  const facebookPixelId = seo.facebookPixelId as string | undefined;
  const googleTagManagerId = seo.googleTagManagerId as string | undefined;
  const ws = useMemo(() => websiteSchema(), []);
  const orgSchema = useMemo(() => organizationSchema({
    name: SITE_NAME,
    url: SITE_URL,
    logo: branding.logo as string | undefined,
    description: "Discover নবME — where heritage craftsmanship meets contemporary elegance. Premium fashion for the discerning.",
  }), [branding.logo]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScrollToTopOnNavigate />
      <Helmet>
        <html lang="en" />
        <link rel="icon" type={faviconUrl.endsWith(".ico") ? "image/x-icon" : "image/svg+xml"} href={faviconUrl || "/favicon.svg"} />

        <script type="application/ld+json">{JSON.stringify(ws)}</script>
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        {customSchema && <script type="application/ld+json">{JSON.stringify(customSchema)}</script>}
        {facebookPixelId && (
          <script>{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', ${JSON.stringify(facebookPixelId)});fbq('track', 'PageView');`}</script>
        )}
        {facebookPixelId && <noscript><img height="1" width="1" style={{display:'none'}} src={`https://www.facebook.com/tr?id=${encodeURIComponent(facebookPixelId)}&ev=PageView&noscript=1`} /></noscript>}
        {googleTagManagerId && (
          <script>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(googleTagManagerId)});`}</script>
        )}
        {customCss && <style>{customCss}</style>}
        <style>{`
          body { background-color: var(--color-bg, #fff); color: var(--color-text, #262626); font-family: var(--font-body); }
          .font-display { font-family: var(--font-display); }
          .text-brand-500, .hover\:text-brand-500:hover { color: var(--color-brand); }
          .bg-brand-500 { background-color: var(--color-brand); }
          .border-brand-500 { border-color: var(--color-brand); }
          .text-brand-600, .hover\:text-brand-600:hover { color: var(--color-brand); filter: brightness(0.85); }
          .bg-brand-600 { background-color: var(--color-brand); filter: brightness(0.85); }
          .text-brand-700 { color: var(--color-brand); filter: brightness(0.7); }
          .bg-brand-700 { background-color: var(--color-brand); filter: brightness(0.7); }
          .bg-brand-50 { background-color: var(--color-brand); opacity: 0.1; }
          .hover\:bg-brand-50:hover { background-color: var(--color-brand); opacity: 0.1; }
          .hover\:bg-brand-100:hover { background-color: var(--color-brand); opacity: 0.15; }
          .border-brand-500\/40 { border-color: color-mix(in srgb, var(--color-brand) 40%, transparent); }
          .ring-brand-500\/40 { --tw-ring-color: color-mix(in srgb, var(--color-brand) 40%, transparent); }
          .text-accent-gold, .text-accent-goldLight { color: var(--color-gold); }
          .bg-accent-gold { background-color: var(--color-gold); }
          .hover\:bg-accent-gold:hover { background-color: var(--color-gold); }
          .bg-accent-goldDark { background-color: var(--color-gold); filter: brightness(0.85); }
          .hover\:bg-accent-goldDark:hover { background-color: var(--color-gold); filter: brightness(0.85); }
          .border-accent-gold { border-color: var(--color-gold); }
          .shadow-gold-soft { box-shadow: 0 4px 20px color-mix(in srgb, var(--color-gold, #c9a84c) 15%, transparent); }
        `}</style>
      </Helmet>
      <div ref={headerRef}>
        <Header />
      </div>
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:bg-brand-500 focus:text-white focus:px-4 focus:py-2 focus:rounded md:focus:top-4 md:focus:left-4 focus:bottom-[80px] focus:left-4">
        Skip to content
      </a>
      <main id="main-content" className="flex-1 pb-[calc(60px+env(safe-area-inset-bottom,0px)+16px)] md:pb-0" style={{ paddingTop: `${headerHeight}px` }}>
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
