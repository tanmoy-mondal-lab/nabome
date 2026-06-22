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
    <section className="bg-neutral-950 text-white section-padding">
      <div className="container-wide text-center max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="editorial-caption text-accent-gold mb-4">
            {section.subtitle ?? "Stay Inspired"}
          </p>
          <h2 className="text-4xl md:text-5xl font-display mb-4 leading-tight">
            {section.title ?? "Join the \u09a8\u09acME World"}
          </h2>
          <p className="text-neutral-400 font-editorial text-lg mb-9 max-w-md mx-auto">
            Subscribe for exclusive access to new drops, private sales, and editor's picks.
          </p>
          <NewsletterForm />
        </motion.div>
      </div>
    </section>
  );
}
