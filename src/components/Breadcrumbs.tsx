import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", padding: "16px 0", fontSize: 14 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {index > 0 && <ChevronRight size={14} style={{ color: "var(--gold)", opacity: 0.6 }} />}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                style={{
                  color: "var(--gold)",
                  textDecoration: "none",
                  opacity: 0.8,
                  transition: "opacity .2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.8"; }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isLast ? "var(--text)" : "var(--gold)",
                  opacity: isLast ? 1 : 0.6,
                }}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
