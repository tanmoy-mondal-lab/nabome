import { motion } from "framer-motion";
import { ShoppingBag, Heart, Package, Bell, Search, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { fadeUp } from "../lib/animations";

const icons = { ShoppingBag, Heart, Package, Bell, Search, Inbox } as const;

type IconName = keyof typeof icons;

type Props = {
  icon?: IconName;
  title: string;
  description?: string;
  action?: { label: string; to: string };
};

export default function EmptyState({ icon = "Inbox", title, description, action }: Props) {
  const Icon = icons[icon];
  return (
    <motion.div
      {...fadeUp}
      style={{
        textAlign: "center",
        padding: "clamp(48px, 8vw, 80px) 24px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "2px solid var(--line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          background: "var(--surface)",
        }}
      >
        <Icon size={32} style={{ color: "var(--muted)" }} />
      </motion.div>
      <h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.7, marginBottom: 24 }}>{description}</p>}
      {action && (
        <Link to={action.to}>
          <motion.span
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="premium-button"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px" }}
          >
            <ShoppingBag size={16} />
            {action.label}
          </motion.span>
        </Link>
      )}
    </motion.div>
  );
}
