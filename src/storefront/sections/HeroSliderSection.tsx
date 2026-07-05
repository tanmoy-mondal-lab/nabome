import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HeroCarousel } from "../components/HeroCarousel";
import { normalizeHeroSlides } from "../../cms/core/hero-slides";

interface Slide {
  id: string;
  videoUrl: string;
  posterUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  soundEnabled: boolean;
}

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface HeroSliderSectionProps {
  section: SectionData;
}

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
};

export default function HeroSliderSection({ section }: HeroSliderSectionProps) {
  const content = section.content ?? {};
  const slides = useMemo(
    () => normalizeHeroSlides(content.slides, { title: section.title, subtitle: section.subtitle }),
    [content.slides, section.subtitle, section.title],
  );
  const interval = (content.interval as number | undefined) ?? 7000;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const hasSlides = slides.length > 0;

  const fallbackSlides = useMemo(() => {
    const hasVideo = slides.some((s) => s.videoUrl);
    
    if (hasVideo) {
      return slides.filter((s) => s.videoUrl).map((slide) => ({
        id: slide.id,
        videoUrl: slide.videoUrl || "",
        posterUrl: slide.posterUrl || "",
        caption: section.title || "Premium Fashion Destination",
        title: slide.title || section.title || "Discover Your Signature Style",
        subtitle: slide.subtitle || section.subtitle || "Curated collections for the discerning individual. Explore luxury fashion crafted for every occasion.",
        ctaText: "Explore Collection",
        ctaUrl: "/products",
        soundEnabled: false,
      }));
    }
    
    return slides.filter((s) => s.posterUrl).map((slide) => ({
      id: slide.id || "fallback-slide",
      videoUrl: "",
      posterUrl: slide.posterUrl || "",
      caption: section.title || "Premium Fashion Destination",
      title: slide.title || section.title || "Discover Your Signature Style",
      subtitle: slide.subtitle || section.subtitle || "Curated collections for the discerning individual. Explore luxury fashion crafted for every occasion.",
      ctaText: "Explore Collection",
      ctaUrl: "/products",
      soundEnabled: false,
    }));
  }, [slides, section.title, section.subtitle]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % fallbackSlides.length);
  }, [fallbackSlides.length]);

  useEffect(() => {
    if (paused || fallbackSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [paused, fallbackSlides.length, nextSlide]);

  const slide = fallbackSlides[currentSlide];

  if (hasSlides) {
    return <HeroCarousel slides={slides} interval={interval} />;
  }

  return (
    <section
      className="relative h-[85vh] md:h-screen min-h-[300px] md:min-h-[600px] bg-neutral-950 flex items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 md:bg-gradient-to-br md:from-neutral-950/50 md:via-neutral-900/30 md:to-neutral-950/20 bg-gradient-to-br from-neutral-950/85 via-neutral-900/60 to-neutral-950/40 z-10" />
      </div>

      <motion.div
        key={currentSlide}
        variants={stagger}
        initial="initial"
        animate="animate"
        className="container-wide relative z-20"
      >
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="md:text-[11px] md:tracking-[0.3em] md:text-white/70 editorial-caption text-accent-gold mb-5 md:mb-8"
        >
          {slide.caption}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-display text-display-2 md:text-[5.5rem] md:leading-[0.92] md:tracking-[-0.02em] text-white leading-[0.95] mb-6 md:mb-8 max-w-4xl"
        >
          <>{slide.title}</>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-editorial text-lg md:text-xl text-neutral-300 md:text-white/60 max-w-xl mb-10 md:mb-12 leading-relaxed md:max-w-lg"
        >
          {slide.subtitle}
        </motion.p>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto"
        >
          {/* Mobile: keep existing buttons */}
          <Link to="/products" className="md:hidden btn-primary text-center">Shop Women</Link>
          <Link to="/products?gender=men" className="md:hidden btn-secondary border-white text-white hover:bg-white hover:text-neutral-900 text-center">Shop Men</Link>
          {/* Desktop: clean text link CTA */}
          <Link to="/products" className="hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-white/80 hover:text-white transition-colors duration-300 group/cta">
            Explore Collection
            <span className="inline-block transition-transform duration-300 group-hover/cta:translate-x-1">&rarr;</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Desktop: minimal dot indicators */}
      <div className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-20 items-center gap-3">
        {fallbackSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`rounded-full transition-all duration-500 ease-luxe-out ${
              i === currentSlide ? "bg-white w-6 h-[1px]" : "bg-white/30 w-[1px] h-[1px] hover:bg-white/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Mobile: keep existing dots */}
      <div className="md:hidden absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {fallbackSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`rounded-full transition-all duration-500 ease-luxe-out ${
              i === currentSlide ? "bg-white w-8 h-1.5" : "bg-white/40 w-1.5 h-1.5 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Desktop: remove bouncing chevron — show only on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="md:hidden absolute bottom-32 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
