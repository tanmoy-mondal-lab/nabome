import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HeroCarousel } from "../components/HeroCarousel";

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
  const slides = (content.slides as Slide[] | undefined) ?? [];
  const interval = (content.interval as number | undefined) ?? 7000;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const hasSlides = slides.length > 0;

  const fallbackSlides = useMemo(() => {
    return [
      {
        image: "",
        caption: section.title || "Premium Fashion Destination",
        title: section.title || "Discover Your Signature Style",
        subtitle: section.subtitle || "Curated collections for the discerning individual. Explore luxury fashion crafted for every occasion.",
      },
    ];
  }, [section.title, section.subtitle]);

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
      className="relative h-screen min-h-[700px] bg-neutral-950 flex items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/85 via-neutral-900/60 to-neutral-950/40 z-10" />
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
          className="editorial-caption text-accent-gold mb-5"
        >
          {slide.caption}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-display text-display-1 text-white leading-[0.95] mb-6"
        >
          <>{slide.title}</>
        </motion.h1>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="display-2 font-editorial text-xl md:text-2xl text-neutral-300 max-w-xl mb-10 leading-relaxed"
        >
          {slide.subtitle}
        </motion.p>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex gap-5"
        >
          <Link to="/products" className="btn-primary">Shop Women</Link>
          <Link to="/products?gender=men" className="btn-secondary border-white text-white hover:bg-white hover:text-neutral-900">Shop Men</Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-20"
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
