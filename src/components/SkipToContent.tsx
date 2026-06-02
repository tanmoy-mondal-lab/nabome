import { useCallback } from "react";

export default function SkipToContent() {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const main = document.querySelector("main") || document.querySelector(".page");
    if (main) {
      (main as HTMLElement).focus();
      main.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      style={{
        position: "fixed",
        top: -100,
        left: 16,
        zIndex: 10001,
        padding: "12px 24px",
        background: "var(--gold)",
        color: "#050505",
        fontWeight: 600,
        fontSize: 14,
        borderRadius: "0 0 8px 8px",
        textDecoration: "none",
        transition: "top .2s ease",
      }}
      onFocus={(e) => { e.currentTarget.style.top = "0"; }}
      onBlur={(e) => { e.currentTarget.style.top = "-100px"; }}
    >
      Skip to content
    </a>
  );
}
