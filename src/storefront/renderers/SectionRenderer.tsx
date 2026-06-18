import { type PageSection } from "../../cms/core/cms-types";

// ─── Individual Section Components ───

function HeroBannerSection({ config }: { config: Record<string, unknown> }) {
  const heading = config.heading as string | undefined;
  const subheading = config.subheading as string | undefined;
  const ctaText = config.ctaText as string | undefined;
  const ctaUrl = config.ctaUrl as string | undefined;
  const bgImage = config.backgroundImage as string | undefined;
  const textAlign = (config.textAlign as string) ?? "center";
  const textColor = (config.textColor as string) ?? "#ffffff";
  const height = (config.height as string) ?? "large";
  const overlay = (config.overlayOpacity as number) ?? 0.3;

  const heightMap: Record<string, string> = {
    small: "h-64 md:h-80",
    medium: "h-80 md:h-96",
    large: "h-96 md:h-[32rem]",
    fullscreen: "h-screen",
  };

  return (
    <section className={`relative flex items-center justify-center overflow-hidden ${heightMap[height] ?? heightMap.large}`} style={{ color: textColor }}>
      {bgImage && (
        <>
          <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />
        </>
      )}
      <div className={`relative z-10 max-w-4xl px-6 text-${textAlign}`}>
        {heading && <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-4 leading-tight">{heading}</h1>}
        {subheading && <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">{subheading}</p>}
        {ctaText && ctaUrl && (
          <a href={ctaUrl} className="inline-block bg-white text-black px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-100 transition-colors">{ctaText}</a>
        )}
      </div>
    </section>
  );
}

function VideoBannerSection({ config }: { config: Record<string, unknown> }) {
  const videoUrl = config.videoUrl as string | undefined;
  const poster = config.posterImage as string | undefined;
  const heading = config.heading as string | undefined;
  const subheading = config.subheading as string | undefined;
  const ctaText = config.ctaText as string | undefined;
  const ctaUrl = config.ctaUrl as string | undefined;
  const autoplay = (config.autoplay as boolean) ?? true;
  const loop = (config.loop as boolean) ?? true;
  const muted = (config.muted as boolean) ?? true;

  return (
    <section className="relative h-96 md:h-[32rem] flex items-center justify-center overflow-hidden">
      {videoUrl && (
        <video autoPlay={autoplay} loop={loop} muted={muted} poster={poster || undefined} className="absolute inset-0 w-full h-full object-cover">
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 text-center text-white max-w-4xl px-6">
        {heading && <h1 className="font-display text-4xl md:text-6xl mb-4">{heading}</h1>}
        {subheading && <p className="text-lg md:text-xl mb-8">{subheading}</p>}
        {ctaText && ctaUrl && <a href={ctaUrl} className="inline-block bg-white text-black px-8 py-3 text-sm font-medium uppercase tracking-wider hover:bg-neutral-100">{ctaText}</a>}
      </div>
    </section>
  );
}

function TextBlockSection({ config }: { config: Record<string, unknown> }) {
  const heading = config.heading as string | undefined;
  const content = config.content as string | undefined;
  const maxWidth = (config.maxWidth as string) ?? "800px";
  const alignment = (config.alignment as string) ?? "left";
  return (
    <section className="py-16 px-6">
      <div className="mx-auto" style={{ maxWidth }}>
        {heading && <h2 className="font-display text-3xl md:text-4xl text-neutral-900 mb-6">{heading}</h2>}
        {content && (
          <div className={`prose prose-neutral max-w-none text-neutral-600 ${alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"}`}
            dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    </section>
  );
}

function ImageBlockSection({ config }: { config: Record<string, unknown> }) {
  const image = config.image as string | undefined;
  const altText = config.altText as string | undefined;
  const caption = config.caption as string | undefined;
  const aspectRatio = config.aspectRatio as string | undefined;
  const fullWidth = config.fullWidth as boolean | undefined;
  return (
    <section className="py-8 px-6">
      <div className={`mx-auto ${fullWidth ? "max-w-full" : "max-w-4xl"}`}>
        <div className="relative overflow-hidden rounded" style={aspectRatio !== "auto" && aspectRatio ? { aspectRatio } as React.CSSProperties : undefined}>
          {image && <img src={image} alt={altText ?? ""} className="w-full h-full object-cover" />}
        </div>
        {caption && <p className="text-sm text-neutral-500 mt-2 text-center">{caption}</p>}
      </div>
    </section>
  );
}

function ProductGridSection({ config }: { config: Record<string, unknown> }) {
  const title = config.title as string | undefined;
  const cols = Number(config.columns) || 4;
  const limit = Number(config.limit) || 8;
  const showViewAll = config.showViewAll as boolean | undefined;
  const viewAllUrl = config.viewAllUrl as string | undefined;
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {title && <h2 className="font-display text-3xl md:text-4xl text-neutral-900 mb-8 text-center">{title}</h2>}
        <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-6`}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-[3/4] bg-neutral-100 rounded mb-3 overflow-hidden">
                <div className="w-full h-full bg-neutral-200 animate-pulse" />
              </div>
              <p className="font-medium text-sm text-neutral-900 truncate">Product Name</p>
              <p className="text-sm text-neutral-500">₹0</p>
            </div>
          ))}
        </div>
        {showViewAll && (
          <div className="text-center mt-8">
            <a href={viewAllUrl ?? "/shop"} className="inline-block border border-neutral-900 text-neutral-900 px-8 py-2.5 text-sm font-medium uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-colors">View All</a>
          </div>
        )}
      </div>
    </section>
  );
}

function NewsletterSection({ config }: { config: Record<string, unknown> }) {
  const heading = config.heading as string | undefined;
  const subheading = config.subheading as string | undefined;
  const placeholder = (config.placeholder as string) ?? "Enter your email";
  const buttonText = (config.buttonText as string) ?? "Subscribe";
  return (
    <section className="py-16 px-6 bg-neutral-50">
      <div className="max-w-xl mx-auto text-center">
        {heading && <h2 className="font-display text-3xl text-neutral-900 mb-3">{heading}</h2>}
        {subheading && <p className="text-neutral-500 mb-6">{subheading}</p>}
        <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder={placeholder} className="flex-1 px-4 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900" />
          <button className="bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium rounded hover:bg-neutral-800 shrink-0">{buttonText}</button>
        </form>
      </div>
    </section>
  );
}

function CountdownTimerSection({ config }: { config: Record<string, unknown> }) {
  const title = config.title as string | undefined;
  const bgColor = (config.backgroundColor as string) ?? "#000000";
  const textColor = (config.textColor as string) ?? "#ffffff";
  return (
    <section className="py-12 px-6 text-center" style={{ backgroundColor: bgColor, color: textColor }}>
      {title && <h3 className="font-display text-2xl mb-4">{title}</h3>}
      <div className="flex justify-center gap-4 text-3xl font-display">
        <div><span className="block text-4xl">00</span><span className="text-xs opacity-70">Days</span></div>
        <span className="text-3xl opacity-50">:</span>
        <div><span className="block text-4xl">00</span><span className="text-xs opacity-70">Hrs</span></div>
        <span className="text-3xl opacity-50">:</span>
        <div><span className="block text-4xl">00</span><span className="text-xs opacity-70">Min</span></div>
        <span className="text-3xl opacity-50">:</span>
        <div><span className="block text-4xl">00</span><span className="text-xs opacity-70">Sec</span></div>
      </div>
    </section>
  );
}

function RichTextSection({ config }: { config: Record<string, unknown> }) {
  const heading = config.heading as string | undefined;
  const content = config.content as string | undefined;
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto prose prose-neutral">
        {heading && <h2 className="font-display text-3xl text-neutral-900 mb-6">{heading}</h2>}
        {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
      </div>
    </section>
  );
}

function PromotionalBannerSection({ config }: { config: Record<string, unknown> }) {
  const bgImage = config.backgroundImage as string | undefined;
  const heading = config.heading as string | undefined;
  const subheading = config.subheading as string | undefined;
  const ctaText = config.ctaText as string | undefined;
  const ctaUrl = config.ctaUrl as string | undefined;
  const discount = config.discount as string | undefined;
  const badge = config.badge as string | undefined;

  return (
    <section className="py-16 px-6 relative overflow-hidden">
      {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 text-center max-w-2xl mx-auto text-white">
        {badge && <span className="inline-block text-sm font-bold bg-red-500 px-3 py-1 rounded mb-4">{badge}</span>}
        {discount && <span className="inline-block text-sm font-bold bg-red-500 px-3 py-1 rounded mb-4">{discount}</span>}
        {heading && <h2 className="font-display text-3xl md:text-5xl mb-3">{heading}</h2>}
        {subheading && <p className="text-lg opacity-90 mb-6">{subheading}</p>}
        {ctaText && ctaUrl && <a href={ctaUrl} className="inline-block bg-white text-black px-8 py-3 text-sm font-medium uppercase tracking-wider">{ctaText}</a>}
      </div>
    </section>
  );
}

function AnnouncementBarSection({ config }: { config: Record<string, unknown> }) {
  const message = config.message as string | undefined;
  const linkText = config.linkText as string | undefined;
  const linkUrl = config.linkUrl as string | undefined;
  const bgColor = (config.backgroundColor as string) ?? "#000000";
  const textColor = (config.textColor as string) ?? "#ffffff";
  return (
    <div className="text-xs text-center py-2.5 px-4" style={{ backgroundColor: bgColor, color: textColor }}>
      <span>{message}</span>
      {linkText && <a href={linkUrl} className="ml-2 underline font-medium">{linkText}</a>}
    </div>
  );
}

function CustomCTASection({ config }: { config: Record<string, unknown> }) {
  const heading = config.heading as string | undefined;
  const body = config.body as string | undefined;
  const ctaText = config.ctaText as string | undefined;
  const ctaUrl = config.ctaUrl as string | undefined;
  const bgImage = config.backgroundImage as string | undefined;
  const overlay = config.overlay as boolean | undefined;
  const ctaStyle = (config.ctaStyle as string) ?? "primary";
  return (
    <section className="py-24 px-6 relative overflow-hidden text-center">
      {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      {overlay && <div className="absolute inset-0 bg-black/30" />}
      <div className="relative z-10 max-w-2xl mx-auto text-white">
        {heading && <h2 className="font-display text-3xl md:text-5xl mb-4">{heading}</h2>}
        {body && <p className="text-lg mb-8 opacity-90">{body}</p>}
        {ctaText && ctaUrl && (
          <a href={ctaUrl} className={`inline-block px-8 py-3 text-sm font-medium uppercase tracking-wider ${ctaStyle === "outline" ? "border-2 border-white text-white hover:bg-white hover:text-black" : "bg-white text-black hover:bg-neutral-100"} transition-colors`}>
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function FAQSection({ config }: { config: Record<string, unknown> }) {
  const title = config.title as string | undefined;
  const faqs = (config.faqs ?? []) as Array<{ question: string; answer: string }>;
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {title && <h2 className="font-display text-3xl text-neutral-900 mb-8 text-center">{title}</h2>}
        {faqs.length > 0 ? (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-neutral-200 rounded-lg">
                <summary className="flex items-center justify-between px-5 py-4 text-sm font-medium text-neutral-900 cursor-pointer list-none">
                  {faq.question}
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-neutral-600" dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </details>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 text-center">No FAQs configured.</p>
        )}
      </div>
    </section>
  );
}

function TestimonialSection({ config }: { config: Record<string, unknown> }) {
  const title = config.title as string | undefined;
  const testimonials = (config.testimonials ?? []) as Array<{ name: string; role: string; content: string; avatar: string; rating: number }>;
  return (
    <section className="py-16 px-6 bg-neutral-50">
      <div className="max-w-4xl mx-auto">
        {title && <h2 className="font-display text-3xl text-neutral-900 mb-8 text-center">{title}</h2>}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded border border-neutral-200">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating ?? 5 }).map((_, s) => <span key={s} className="text-yellow-400 text-sm">★</span>)}
              </div>
              <p className="text-sm text-neutral-600 mb-4 italic">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                {t.avatar && <img src={t.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />}
                <div>
                  <p className="text-sm font-medium text-neutral-900">{t.name}</p>
                  {t.role && <p className="text-xs text-neutral-400">{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DefaultSection({ config }: { config: Record<string, unknown> }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <pre className="text-xs text-neutral-400 bg-neutral-50 p-4 rounded overflow-x-auto">{JSON.stringify(config, null, 2)}</pre>
      </div>
    </section>
  );
}

// ─── Component Registry ───

const SECTION_COMPONENTS: Record<string, React.ComponentType<{ config: Record<string, unknown> }>> = {
  hero_banner: HeroBannerSection,
  video_banner: VideoBannerSection,
  text_block: TextBlockSection,
  image_block: ImageBlockSection,
  product_grid: ProductGridSection,
  product_carousel: ProductGridSection,
  collection_grid: ProductGridSection,
  collection_carousel: ProductGridSection,
  category_grid: ProductGridSection,
  brand_story: TextBlockSection,
  testimonial: TestimonialSection,
  faq: FAQSection,
  newsletter: NewsletterSection,
  contact: TextBlockSection,
  rich_text: RichTextSection,
  shop_the_look: ImageBlockSection,
  promotional_banner: PromotionalBannerSection,
  announcement_bar: AnnouncementBarSection,
  countdown_timer: CountdownTimerSection,
  custom_cta: CustomCTASection,
};

// ─── Main Renderer ───

export function SectionRenderer({ sections }: { sections: PageSection[] }) {
  const visible = sections.filter((s) => s.visibility?.isVisible !== false);

  if (visible.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center text-neutral-400">
          <p className="text-sm">This page has no visible sections.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {visible.map((section) => {
        const Component = SECTION_COMPONENTS[section.type] ?? DefaultSection;
        const customStyles: Record<string, string> = {};
        if (section.styles?.backgroundColor) customStyles.backgroundColor = section.styles.backgroundColor as string;
        if (section.styles?.padding) customStyles.padding = section.styles.padding as string;
        if (section.styles?.margin) customStyles.margin = section.styles.margin as string;
        if (section.styles?.maxWidth) customStyles.maxWidth = section.styles.maxWidth as string;
        return (
          <div key={section.id} style={Object.keys(customStyles).length ? customStyles as React.CSSProperties : undefined}>
            <Component config={section.config} />
          </div>
        );
      })}
    </>
  );
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-white">{children}</main>;
}

export function ThemeWrapper({ children, theme }: { children: React.ReactNode; theme?: Record<string, unknown> }) {
  const design = theme?.design as Record<string, unknown> | undefined;
  const colors = design?.colors as Record<string, string> | undefined;
  return (
    <div style={colors ? { "--color-primary": colors.primary, "--color-accent": colors.accent, "--color-bg": colors.background, "--color-text": colors.text } as React.CSSProperties : undefined}>
      {children}
    </div>
  );
}
