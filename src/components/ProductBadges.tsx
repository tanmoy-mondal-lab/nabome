import { motion } from "framer-motion";

type Badge = {
  type: string;
  label: string;
  color: string;
  bg: string;
};

type Props = {
  badges: Badge[];
  size?: "sm" | "md";
};

export default function ProductBadges({ badges, size = "sm" }: Props) {
  const isSm = size === "sm";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {badges.map((badge, i) => (
        <motion.span
          key={`${badge.type}-${i}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: isSm ? "3px 10px" : "6px 14px",
            borderRadius: 20, fontSize: isSm ? ".7rem" : ".78rem",
            fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.04em",
            background: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.color}30`,
          }}
        >
          {badge.label}
        </motion.span>
      ))}
    </div>
  );
}
