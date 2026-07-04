import { Link } from "react-router-dom";
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Music2, MessageCircle, Globe, Bookmark, ArrowUp } from "lucide-react";
import { useSettings, type SiteSettings } from "../hooks/useSettings";
import { useFooter } from "../hooks/useFooter";
import { usePolicyPages } from "../hooks/usePolicyPages";
import type { ThemeBranding, ThemeFooterConfig } from "../../cms/core/cms-types";
import { NewsletterForm } from "../components/NewsletterForm";

const SOCIAL_ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  pinterest: Bookmark,
  tiktok: Music2,
  whatsapp: MessageCircle,
  other: Globe,
};
const DEFAULT_POLICY_LINKS = [
  { label: "Privacy", url: "/privacy" },
  { label: "Terms", url: "/terms" },
  { label: "Shipping & Returns", url: "/shipping-returns" },
  { label: "FAQ", url: "/faq" },
];

export function Footer() {
  const { data: settings } = useSettings();
  const { data: footerSections = [] } = useFooter();
  const { data: policyPages = [] } = usePolicyPages();

  const theme = settings?.theme;
  const themeBranding = theme?.branding as ThemeBranding | undefined;
  const footerConfig = theme?.footer as ThemeFooterConfig | undefined;
  const socialLinks = settings?.socialLinks ?? [];
  const columns = footerSections.reduce<Array<typeof footerSections>>((acc, section) => {
    const col = (section.column as number) ?? 0;
    if (!acc[col]) acc[col] = [];
    acc[col].push(section);
    return acc;
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="bg-luxe-charcoal text-neutral-300">
      {/* Newsletter Bar */}
      {footerConfig?.showNewsletter !== false && <div className="md:border-white/10 border-b border-white/5">
        <div className="container-wide md:py-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="md:text-[10px] md:text-white/50 text-xs tracking-[0.2em] uppercase text-accent-goldLight mb-1">{(settings?.preferences as Record<string, unknown>)?.newsletterTitle as string || "Stay Connected"}</p>
            <p className="md:text-xl font-display text-lg text-white">{(settings?.preferences as Record<string, unknown>)?.newsletterSubtitle as string || "Join the নবME Inner Circle"}</p>
          </div>
          <NewsletterForm layout="inline" />
        </div>
      </div>}

      {/* Main Footer */}
      <div className="container-wide md:py-20 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 md:gap-12 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="font-display md:text-2xl md:tracking-[0.35em] text-xl tracking-[0.3em] text-white">{settings?.siteName || themeBranding?.brandName as string || "নবME"}</Link>
            <p className="md:text-white/40 md:mt-5 text-sm text-neutral-500 mt-4 leading-relaxed max-w-xs">
              {settings?.tagline || themeBranding?.brandTagline as string || themeBranding?.brandDescription as string || "Premium fashion for the discerning individual. Curated collections delivered worldwide."}
            </p>
            {footerConfig?.showSocialLinks !== false && <div className="flex gap-4 mt-8">
              {socialLinks.map((link) => {
                const platform = link.platform as string;
                const Icon = SOCIAL_ICONS[platform];
                if (!Icon) return null;
                return (
                  <a key={platform} href={link.url as string} target="_blank" rel="noopener noreferrer"
                    className="md:hover:border-white/30 md:hover:text-white w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:border-accent-gold hover:text-accent-gold transition-all duration-300"
                    aria-label={`Follow us on ${platform}`}
                  >
                    <Icon className="md:w-3.5 md:h-3.5 w-4 h-4" />
                  </a>
                );
              })}
            </div>}
          </div>

          {/* Link Columns */}
          {columns.map((col, i) => (
            <div key={i} className="col-span-1">
              {col.map((section) => {
                const contentType = section.contentType as string;
                const content = typeof section.content === "string"
                  ? (() => {
                      try { return JSON.parse(section.content) as Record<string, unknown>; } catch { return {}; }
                    })()
                  : (section.content as Record<string, unknown> | null);
                const links = contentType === "links" ? (content?.links as { label: string; url: string }[] ?? []) : [];
                const text = contentType === "text" ? (content?.text as string ?? "") : "";
                return (
                  <div key={section.id as string} className={i > 0 || col.indexOf(section) > 0 ? "mt-8 first:mt-0" : ""}>
                    <h4 className="md:text-[10px] md:tracking-[0.2em] md:text-white/60 md:font-normal text-xs uppercase tracking-[0.15em] text-white font-medium mb-5">
                      {section.title as string}
                    </h4>
                    {contentType === "links" && links.map((link, j) => {
                      const isExternal = link.url.startsWith("http");
                      if (isExternal) {
                        return (
                          <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="block md:text-[13px] md:text-white/40 md:py-2 text-sm text-neutral-400 hover:text-white py-1.5 transition-colors duration-200"
                          >
                            {link.label}
                          </a>
                        );
                      }
                      return (
                        <Link key={j} to={link.url}
                          className="block md:text-[13px] md:text-white/40 md:py-2 text-sm text-neutral-400 hover:text-white py-1.5 transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                    {contentType === "text" && (
                      <p className="md:text-[13px] md:text-white/40 text-sm text-neutral-400">{text}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Contact Column */}
          {footerConfig?.showContact !== false && <div className="col-span-2 md:col-span-1">
            <h4 className="md:text-[10px] md:tracking-[0.2em] md:text-white/60 md:font-normal text-xs uppercase tracking-[0.15em] text-white font-medium mb-5">Contact</h4>
            <div className="space-y-3 md:text-[13px] md:text-white/40 text-sm text-neutral-400">
              <p>{settings?.contactEmail || "hello@নবME.com"}</p>
              <p>{settings?.contactPhone || "+91 1800 123 4567"}</p>
            </div>
          </div>}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-wide py-6 md:py-8 flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
          <p className="md:text-[11px] md:text-white/30 text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} {settings?.siteName || "নবME"}. All rights reserved.
          </p>
          {footerConfig?.showPolicyLinks !== false && <div className="flex flex-wrap justify-center md:flex-nowrap items-center gap-4 md:gap-8 md:text-[11px] md:text-white/30 text-xs text-neutral-500">
            {(() => {
              const footerLinks = (settings?.preferences as Record<string, unknown>)?.footerLinks as { label: string; url: string }[] | undefined;
              const policyLinks = policyPages.map((p) => ({ label: p.title, url: `/${p.slug}` }));
              const links = footerLinks?.length ? footerLinks : (policyLinks.length ? policyLinks : DEFAULT_POLICY_LINKS);
              return links.map((link) => (
                <Link key={link.url} to={link.url} className="md:hover:text-white/60 hover:text-white transition-colors">{link.label}</Link>
              ));
            })()}
          </div>}
          <button onClick={scrollToTop}
            className="md:gap-2 md:text-[11px] md:text-white/30 md:hover:text-white/60 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"
          >
            Back to top <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
