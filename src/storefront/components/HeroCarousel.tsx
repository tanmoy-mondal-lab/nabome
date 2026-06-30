import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Volume2, VolumeX, ChevronDown, Pause, Play } from "lucide-react";
import { SafeImage } from "../../components/SafeImage";

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

interface HeroCarouselProps {
  slides: Slide[];
  interval?: number;
}

export function HeroCarousel({ slides, interval = 7000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const prefersReducedMotion = useReducedMotion();

  const totalSlides = slides.length;
  const hasVideoSlides = slides.some((slide) => !!slide.videoUrl);

  const goTo = useCallback((idx: number) => {
    setVideoReady(false);
    setCurrent(idx);
  }, []);

  const goNext = useCallback(() => {
    setVideoReady(false);
    setCurrent((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (paused || prefersReducedMotion || totalSlides <= 1) return;
    timerRef.current = setInterval(goNext, interval);
    return () => clearInterval(timerRef.current);
  }, [goNext, interval, paused, prefersReducedMotion, totalSlides]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === current) {
        v.currentTime = 0;
        v.play().catch(() => { /* non-critical: autoplay not supported */ });
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [current]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v) v.muted = !soundOn;
    });
  }, [soundOn]);

  if (totalSlides === 0) return null;

  const slide = slides[current];

  return (
    <section
      className="relative h-screen max-h-[900px] min-h-[600px] w-full overflow-hidden bg-neutral-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Video backgrounds */}
      {slides.map((s, i) => (
        <div
          key={`${s.id || s.title || "slide"}-${i}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {s.videoUrl ? (
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              src={s.videoUrl}
              poster={s.posterUrl || undefined}
              muted={!soundOn}
              loop
              playsInline
              preload={i === 0 ? "auto" : "metadata"}
              className="w-full h-full object-cover"
              onCanPlay={() => { if (i === current) setVideoReady(true); }}
            />
          ) : s.posterUrl ? (
            <SafeImage
              src={s.posterUrl}
              alt=""
              className="w-full h-full object-cover"
              priority={i === 0}
              responsive={false}
            />
          ) : (
            <div className="w-full h-full bg-neutral-900" />
          )}
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

      {/* Content overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6"
        >
          {slide.title && (
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-display text-display-2 tracking-wide mb-4 max-w-4xl"
            >
              {slide.title}
            </motion.h1>
          )}
          {slide.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base md:text-lg text-white/80 max-w-2xl mb-8"
            >
              {slide.subtitle}
            </motion.p>
          )}
          {slide.ctaText && slide.ctaUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link
                to={slide.ctaUrl}
                className="inline-block bg-white text-neutral-900 px-8 py-3 text-sm font-medium tracking-wider hover:bg-neutral-100 transition-colors"
              >
                {slide.ctaText}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {totalSlides > 1 && (
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i === current ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sound toggle */}
      {hasVideoSlides && (
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="absolute bottom-12 right-8 p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label={soundOn ? "Mute" : "Unmute"}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      {/* Pause/Play */}
      <button
        onClick={() => setPaused(!paused)}
        className="absolute bottom-12 right-20 p-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
        aria-label={paused ? "Play" : "Pause"}
      >
        {paused ? <Play size={18} /> : <Pause size={18} />}
      </button>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown size={20} className="text-white/50" />
      </div>
    </section>
  );
}
