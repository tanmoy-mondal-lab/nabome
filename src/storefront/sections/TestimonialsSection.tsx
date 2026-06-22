import { motion } from "framer-motion";
import { StarRating } from "../components/StarRating";
import { SafeImage } from "../../components/SafeImage";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
}

interface TestimonialsSectionProps {
  section: SectionData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function TestimonialsSection({ section }: TestimonialsSectionProps) {
  const content = section.content ?? {};
  const testimonials = (content.testimonials as Testimonial[] | undefined) ?? [];

  if (testimonials.length === 0) return null;

  const title = section.title ?? "What Our Customers Say";
  const subtitle = section.subtitle ?? "Real stories from real people who love নবME.";

  const getColumns = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <section className="container-wide section-padding">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-display text-neutral-900 mb-3">
          {title}
        </h2>
        {subtitle && (
          <p className="text-neutral-500 max-w-xl mx-auto">{subtitle}</p>
        )}
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`grid ${getColumns(testimonials.length)} gap-6`}
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            className="border border-neutral-200 rounded-lg p-6 bg-white shadow-sm flex flex-col"
          >
            <StarRating rating={t.rating} className="mb-3" />
            <p className="text-neutral-700 leading-relaxed flex-1 mb-4">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              {t.avatar ? (
                <SafeImage
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
                {t.location && (
                  <p className="text-xs text-neutral-500">{t.location}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
