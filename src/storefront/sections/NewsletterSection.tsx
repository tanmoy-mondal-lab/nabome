import { motion } from "framer-motion";
import { NewsletterForm } from "../components/NewsletterForm";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface NewsletterSectionProps {
  section: SectionData;
}

export default function NewsletterSection({ section }: NewsletterSectionProps) {
  return (
    <section className="md:bg-white md:border-t md:border-neutral-100 bg-neutral-950 text-white md:text-neutral-900 section-padding">
      <div className="container-wide text-center max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="md:text-[10px] md:tracking-[0.2em] md:uppercase md:text-neutral-400 editorial-caption md:mb-4 text-accent-gold mb-4">
            {section.subtitle ?? "Stay Inspired"}
          </p>
          <h2 className="md:text-6xl md:text-neutral-900 md:mb-4 text-4xl md:text-5xl font-display mb-4 leading-tight">
            {section.title ?? "Join the \u09a8\u09acME World"}
          </h2>
          <p className="md:text-neutral-500 md:font-body md:text-base md:mb-10 text-neutral-400 font-editorial text-lg mb-9 max-w-md mx-auto">
            Subscribe for exclusive access to new drops, private sales, and editor&apos;s picks.
          </p>
          <NewsletterForm />
        </motion.div>
      </div>
    </section>
  );
}
