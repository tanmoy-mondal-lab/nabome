import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils/cn";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-xs text-neutral-500", className)}>
      <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3" />
          {item.href ? (
            <Link to={item.href} className="hover:text-neutral-900 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-neutral-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
