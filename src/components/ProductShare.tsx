import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy } from "lucide-react";
import { useToast } from "./Toast";

type Props = {
  productName: string;
  productUrl: string;
};

export default function ProductShare({ productName, productUrl }: Props) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      showToast("Link copied to clipboard!");
    } catch {
      showToast("Failed to copy link");
    }
    setOpen(false);
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check out ${productName}&url=${encodeURIComponent(productUrl)}`, "_blank");
    setOpen(false);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 16px", border: "1px solid var(--line)",
          background: "transparent", color: "var(--muted)",
          cursor: "pointer", borderRadius: "var(--radius)",
          fontSize: ".82rem", transition: "all 0.2s",
        }}
      >
        <Share2 size={16} /> Share
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: "100%", left: 0, marginTop: 8,
              background: "var(--surface)", border: "1px solid var(--line)",
              borderRadius: "var(--radius-xl)", overflow: "hidden",
              minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              zIndex: 100,
            }}
          >
            <button onClick={copyLink} style={optionStyle}>
              <Copy size={16} /> Copy Link
            </button>
            <button onClick={shareTwitter} style={optionStyle}>
              <span style={{ fontSize: 16 }}>𝕏</span> Share on X
            </button>
            <button onClick={shareFacebook} style={optionStyle}>
              <span style={{ fontSize: 16 }}>f</span> Share on Facebook
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const optionStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  width: "100%", padding: "12px 16px",
  border: "none", background: "transparent",
  color: "var(--text)", cursor: "pointer",
  fontSize: ".85rem", textAlign: "left",
  transition: "background 0.15s",
};
