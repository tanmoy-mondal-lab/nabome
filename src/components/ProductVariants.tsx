import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ProductVariant, ProductSize } from "../types/product";

type Props = {
  variants: ProductVariant[];
  selectedSize: string;
  selectedColor: string;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
};

export default function ProductVariants({ variants, selectedSize, selectedColor, onSizeChange, onColorChange }: Props) {
  const sizes = useMemo(() => {
    const map = new Map<string, ProductVariant[]>();
    variants.forEach((v) => {
      if (!map.has(v.size)) map.set(v.size, []);
      map.get(v.size)!.push(v);
    });
    return Array.from(map.entries()).map(([size, vars]) => ({
      size: size as ProductSize,
      inStock: vars.some((v) => v.stock > 0),
      totalStock: vars.reduce((s, v) => s + v.stock, 0),
    }));
  }, [variants]);

  const colors = useMemo(() => {
    const map = new Map<string, ProductVariant[]>();
    variants.forEach((v) => {
      if (!map.has(v.color)) map.set(v.color, []);
      map.get(v.color)!.push(v);
    });
    return Array.from(map.entries()).map(([color, vars]) => ({
      color,
      swatch: vars[0].colorSwatch,
      inStock: vars.some((v) => v.stock > 0),
      totalStock: vars.reduce((s, v) => s + v.stock, 0),
    }));
  }, [variants]);

  const currentVariant = useMemo(
    () => variants.find((v) => v.size === selectedSize && v.color === selectedColor) || null,
    [variants, selectedSize, selectedColor]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ color: "var(--muted)", fontSize: ".82rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Size: <strong style={{ color: "var(--text)" }}>{selectedSize}</strong>
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {sizes.map((s) => {
            const active = s.size === selectedSize;
            return (
              <motion.button
                key={s.size}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => s.inStock && onSizeChange(s.size)}
                disabled={!s.inStock}
                style={{
                  minWidth: 48, height: 48, padding: "0 16px",
                  border: `1px solid ${active ? "var(--gold)" : s.inStock ? "var(--line)" : "var(--line)"}`,
                  background: active ? "var(--gold-soft)" : "transparent",
                  color: active ? "var(--gold)" : s.inStock ? "var(--text)" : "var(--muted)",
                  cursor: s.inStock ? "pointer" : "not-allowed",
                  borderRadius: "var(--radius)", fontWeight: active ? 700 : 500,
                  fontSize: ".85rem", opacity: s.inStock ? 1 : 0.4,
                  transition: "all 0.2s", position: "relative",
                }}
              >
                {s.size}
                {!s.inStock && (
                  <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-45deg)", width: "120%", height: 1, background: "var(--muted)", opacity: 0.3 }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ color: "var(--muted)", fontSize: ".82rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Color: <strong style={{ color: "var(--text)" }}>{selectedColor}</strong>
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {colors.map((c) => {
            const active = c.color === selectedColor;
            return (
              <motion.button
                key={c.color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => c.inStock && onColorChange(c.color)}
                disabled={!c.inStock}
                title={`${c.color}${!c.inStock ? " (Out of Stock)" : ""}`}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: active ? "2px solid var(--gold)" : "2px solid var(--line)",
                  background: c.swatch || c.color.toLowerCase(),
                  cursor: c.inStock ? "pointer" : "not-allowed",
                  opacity: c.inStock ? 1 : 0.3,
                  transition: "all 0.2s",
                  boxShadow: active ? "0 0 0 3px var(--gold-soft)" : "none",
                  position: "relative",
                }}
              >
                {!c.inStock && (
                  <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-45deg)", width: "80%", height: 1.5, background: "var(--muted)", opacity: 0.5 }} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {currentVariant && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", borderRadius: "var(--radius)",
            background: currentVariant.stock > 0 ? "rgba(46,204,113,0.08)" : "rgba(231,76,60,0.08)",
            border: `1px solid ${currentVariant.stock > 0 ? "rgba(46,204,113,0.2)" : "rgba(231,76,60,0.2)"}`,
          }}
        >
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: currentVariant.stock > 0 ? "#2ecc71" : "#e74c3c",
          }} />
          <span style={{ fontSize: ".85rem", fontWeight: 500 }}>
            {currentVariant.stock > 0
              ? currentVariant.stock <= 10
                ? `Only ${currentVariant.stock} left in stock`
                : `${currentVariant.stock} in stock`
              : "Out of stock"}
          </span>
          <span style={{ fontSize: ".78rem", color: "var(--muted)", marginLeft: "auto" }}>
            SKU: {currentVariant.sku}
          </span>
        </motion.div>
      )}
    </div>
  );
}
