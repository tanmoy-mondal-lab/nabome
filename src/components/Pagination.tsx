import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, from, to, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    padding: "8px 12px",
    border: "1px solid var(--line)",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
    borderRadius: 6,
    fontSize: ".82rem",
    fontWeight: 500,
    transition: "all var(--transition-fast)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    height: 36,
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    borderColor: "var(--gold)",
    background: "var(--gold-soft)",
    color: "var(--gold)",
    fontWeight: 700,
  };

  const btnDisabled: React.CSSProperties = {
    ...btnBase,
    opacity: 0.3,
    cursor: "not-allowed",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
      <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>
        Showing {total > 0 ? from + 1 : 0}–{to} of {total}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={page <= 1 ? btnDisabled : btnBase}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "var(--muted)", fontSize: ".82rem" }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={p === page ? btnActive : btnBase}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={page >= totalPages ? btnDisabled : btnBase}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
