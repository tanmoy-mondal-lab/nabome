import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../lib/api/client";
import { Heart, Instagram, Youtube, Twitter, Facebook, ArrowUp, ChevronRight } from "lucide-react";

const SOCIAL_ICONS: Record<string, typeof Instagram> = { instagram: Instagram, youtube: Youtube, twitter: Twitter, facebook: Facebook };

export function Footer() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [footerSections, setFooterSections] = useState<Record<string, unknown>[]>([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    api.get("/api/settings", { params: { action: "public" } })
      .then((s) => setSettings(s as Record<string, unknown>))
      .catch(() => {});
    api.get("/api/cms/footer")
      .then((f) => setFooterSections(((f as Record<string, unknown>).sections ?? []) as Record<string, unknown>[]))
      .catch(() => {});
    const onSettingsUpdate = () => {
      api.get("/api/settings", { params: { action: "public" } })
        .then((s) => setSettings(s as Record<string, unknown>))
        .catch(() => {});
    };
    window.addEventListener("settings:updated", onSettingsUpdate);
    return () => window.removeEventListener("settings:updated", onSettingsUpdate);
  }, []);

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post("/api/contact", { action: "newsletter", email });
      setEmail("");
      setSubscribed(true);
    } catch { /* ignore */ }
  }

  const socialLinks = settings.socialLinks as Record<string, string>[] ?? [];
  const columns = footerSections.reduce((acc: Record<string, unknown>[][], section) => {
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
      <div className="border-b border-white/5">
        <div className="container-wide py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-accent-goldLight mb-1">{(settings.preferences as Record<string, unknown>)?.newsletterTitle as string || "Stay Connected"}</p>
            <p className="text-lg font-display text-white">{(settings.preferences as Record<string, unknown>)?.newsletterSubtitle as string || "Join the নবME Inner Circle"}</p>
          </div>
          <form onSubmit={handleNewsletter} className="flex w-full max-w-md border-b border-white/20">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" required
              className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none"
            />
            <button type="submit" className="text-xs uppercase tracking-widest text-accent-gold hover:text-accent-goldLight px-4 transition-colors whitespace-nowrap">
              {subscribed ? "Joined ✓" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="font-display text-xl tracking-[0.3em] text-white">{(settings.siteName as string) || "নবME"}</Link>
            <p className="text-sm text-neutral-500 mt-4 leading-relaxed max-w-xs">
              {(settings.tagline as string) || "Premium fashion for the discerning individual. Curated collections delivered worldwide."}
            </p>
            <div className="flex gap-3 mt-8">
              {socialLinks.map((link) => {
                const platform = link.platform as string;
                const Icon = SOCIAL_ICONS[platform];
                if (!Icon) return null;
                return (
                  <a key={platform} href={link.url as string} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center hover:border-accent-gold hover:text-accent-gold transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col, i) => (
            <div key={i} className="col-span-1">
              {col.map((section) => {
                const contentType = section.contentType as string;
                const content = section.content as Record<string, unknown> | null;
                const links = contentType === "links" ? (content?.links as { label: string; url: string }[] ?? []) : [];
                const text = contentType === "text" ? (content?.text as string ?? "") : "";
                return (
                  <div key={section.id as string} className={i > 0 || col.indexOf(section) > 0 ? "mt-8 first:mt-0" : ""}>
                    <h4 className="text-xs uppercase tracking-[0.15em] text-white font-medium mb-5">
                      {section.title as string}
                    </h4>
                    {contentType === "links" && links.map((link, j) => (
                      <Link key={j} to={link.url}
                        className="block text-sm text-neutral-400 hover:text-white py-1.5 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ))}
                    {contentType === "text" && (
                      <p className="text-sm text-neutral-400 leading-relaxed">{text}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Contact Column */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs uppercase tracking-[0.15em] text-white font-medium mb-5">Contact</h4>
            <div className="space-y-3 text-sm text-neutral-400">
              <p>{(settings.contactEmail as string) || "hello@নবME.com"}</p>
              <p>{(settings.contactPhone as string) || "+91 1800 123 4567"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} {(settings.siteName as string) || "নবME"}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            {((settings.preferences as Record<string, unknown>)?.footerLinks as { label: string; url: string }[])?.length
              ? ((settings.preferences as Record<string, unknown>)?.footerLinks as { label: string; url: string }[]).map((link) => (
                <Link key={link.url} to={link.url} className="hover:text-white transition-colors">{link.label}</Link>
              ))
              : (
                <>
                  <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                  <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                  <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
                  <Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link>
                </>
              )
            }
          </div>
          <button onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"
          >
            Back to top <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
