import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { api } from "../../lib/api/client";
import SectionRenderer from "../sections/SectionRenderer";
import { canonical, websiteSchema } from "../../lib/seo";

interface SectionData {
  id: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

export default function HomePage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    api.get("/api/settings", { params: { action: "public" } })
      .then((s) => setSettings(s as Record<string, unknown>))
      .catch(() => {});
    api.get("/api/homepage")
      .then((res) => {
        const data = res as { sections: SectionData[] };
        setSections(data.sections ?? []);
      })
      .catch(() => {});
  }, []);

  const hasTrustBar = sections.some((s) => s.sectionType === "trust_bar");

  return (
    <div>
      <Helmet>
        <title>নবME — Premium Fashion</title>
        <meta name="description" content="Discover নবME — where heritage craftsmanship meets contemporary elegance. Premium fashion for the discerning." />
        <link rel="canonical" href={canonical("/")} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="নবME — Premium Fashion" />
        <meta property="og:description" content="Discover নবME — where heritage craftsmanship meets contemporary elegance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical("/")} />
        <meta property="og:site_name" content="নবME" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@নবME" />
        <meta name="twitter:title" content="নবME — Premium Fashion" />
        <meta name="twitter:description" content="Discover নবME — where heritage craftsmanship meets contemporary elegance." />
        <script type="application/ld+json">{JSON.stringify(websiteSchema())}</script>
      </Helmet>

      {sections.length === 0 ? (
        <section className="relative h-screen min-h-[700px] bg-neutral-950 flex items-center justify-center">
          <div className="text-center">
            <p className="editorial-caption text-accent-gold mb-5">{(settings.tagline as string) || "Premium Fashion Destination"}</p>
            <h1 className="font-display text-6xl md:text-8xl text-white leading-[0.95] mb-6">
              Discover Your<br /><span className="text-accent-gold">Signature Style</span>
            </h1>
            <p className="font-editorial text-xl text-neutral-300 max-w-xl mx-auto">
              Curated collections for the discerning individual.
            </p>
          </div>
        </section>
      ) : (
        sections.map((s) => (
          <SectionRenderer key={s.id} section={s} />
        ))
      )}

      {!hasTrustBar && (
        <section className="container-wide section-padding-sm border-t border-neutral-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-10">
            {[
              { title: "Free Shipping", desc: "On orders above ₹999" },
              { title: "Easy Returns", desc: "30-day return policy" },
              { title: "Secure Payment", desc: "100% secure checkout" },
              { title: "Premium Service", desc: "Dedicated support" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-4">
                  <span className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-1">{item.title}</h4>
                <p className="text-xs text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}