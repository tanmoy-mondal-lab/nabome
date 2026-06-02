import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import type { ProductFilterState, Gender, ProductSize } from "../types/product";
import { priceRanges } from "../lib/mockProductData";

type Props = {
  filters: ProductFilterState;
  onChange: (filters: Partial<ProductFilterState>) => void;
  onReset: () => void;
  categories: string[];
  subcategories: string[];
  brands: string[];
  vendors: string[];
  onClose?: () => void;
};

type SectionProps = {
  title: string;
  open?: boolean;
  children: React.ReactNode;
};

function FilterSection({ title, open = true, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 16, marginBottom: 16 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: "4px 0", fontSize: ".85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {title}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div style={{ paddingTop: 10 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChipGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)}
            style={{
              padding: "6px 12px", borderRadius: 20, fontSize: ".78rem",
              border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
              background: active ? "var(--gold-soft)" : "transparent",
              color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer",
              fontWeight: active ? 600 : 400, transition: "all 0.15s",
            }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

const genders: Gender[] = ["Male", "Female", "Unisex"];
const sizes: ProductSize[] = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const colors = ["Black", "White", "Navy", "Red", "Blue", "Green", "Grey", "Maroon", "Gold", "Pink", "Purple", "Brown"];

export default function FilterSidebar({ filters, onChange, onReset, categories, subcategories, brands, vendors: _vendors, onClose }: Props) {
  const handlePriceRange = (min: number, max: number) => {
    if (filters.priceRange[0] === min && filters.priceRange[1] === max) {
      onChange({ priceRange: [0, 99999] });
    } else {
      onChange({ priceRange: [min, max] });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Filters</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onReset}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".75rem" }}>
            <RotateCcw size={12} /> Reset
          </button>
          {onClose && (
            <button onClick={onClose}
              style={{ width: 32, height: 32, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <FilterSection title="Search">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search products..."
          style={{
            width: "100%", padding: "10px 14px", border: "1px solid var(--line)",
            background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)",
            fontSize: ".85rem", outline: "none",
          }}
        />
      </FilterSection>

      <FilterSection title="Category">
        <ChipGroup options={categories} selected={filters.category} onChange={(v) => onChange({ category: v })} />
      </FilterSection>

      <FilterSection title="Subcategory">
        <ChipGroup options={subcategories} selected={filters.subcategory} onChange={(v) => onChange({ subcategory: v })} />
      </FilterSection>

      <FilterSection title="Price Range">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {priceRanges.map((range) => {
            const active = filters.priceRange[0] === range.min && filters.priceRange[1] === range.max;
            return (
              <button key={range.label} onClick={() => handlePriceRange(range.min, range.max)}
                style={{
                  padding: "8px 12px", borderRadius: "var(--radius)", fontSize: ".82rem",
                  border: `1px solid ${active ? "var(--gold)" : "transparent"}`,
                  background: active ? "var(--gold-soft)" : "var(--surface-strong)",
                  color: active ? "var(--gold)" : "var(--text)", cursor: "pointer", textAlign: "left",
                  fontWeight: active ? 600 : 400, transition: "all 0.15s",
                }}>
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Brand">
        <ChipGroup options={brands} selected={filters.brands} onChange={(v) => onChange({ brands: v })} />
      </FilterSection>

      <FilterSection title="Gender">
        <ChipGroup options={genders} selected={filters.gender} onChange={(v) => onChange({ gender: v as Gender[] })} />
      </FilterSection>

      <FilterSection title="Size">
        <ChipGroup options={sizes} selected={filters.sizes} onChange={(v) => onChange({ sizes: v as ProductSize[] })} />
      </FilterSection>

      <FilterSection title="Color">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {colors.map((color) => {
            const active = filters.colors.includes(color);
            return (
              <button key={color} onClick={() => onChange({ colors: active ? filters.colors.filter((c) => c !== color) : [...filters.colors, color] })}
                title={color}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: active ? "2px solid var(--gold)" : "2px solid var(--line)",
                  background: color.toLowerCase(),
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: active ? "0 0 0 2px var(--gold-soft)" : "none",
                }}
              />
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[4, 3, 2, 1].map((star) => {
            const active = filters.rating === star;
            return (
              <button key={star} onClick={() => onChange({ rating: active ? null : star })}
                style={{
                  padding: "6px 12px", borderRadius: "var(--radius)", fontSize: ".82rem",
                  border: `1px solid ${active ? "var(--gold)" : "transparent"}`,
                  background: active ? "var(--gold-soft)" : "transparent",
                  color: active ? "var(--gold)" : "var(--text)", cursor: "pointer", textAlign: "left",
                }}>
                {star} ★ & above
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "in_stock", "out_of_stock"] as const).map((opt) => {
            const active = filters.availability === opt;
            return (
              <button key={opt} onClick={() => onChange({ availability: opt })}
                style={{
                  flex: 1, padding: "8px", borderRadius: "var(--radius)", fontSize: ".75rem",
                  border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
                  background: active ? "var(--gold-soft)" : "transparent",
                  color: active ? "var(--gold)" : "var(--muted)", cursor: "pointer",
                  fontWeight: active ? 600 : 400, textTransform: "capitalize",
                }}>
                {opt.replace("_", " ")}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Discount">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[10, 20, 30, 40, 50].map((disc) => {
            const active = filters.discount === disc;
            return (
              <button key={disc} onClick={() => onChange({ discount: active ? null : disc })}
                style={{
                  padding: "6px 12px", borderRadius: "var(--radius)", fontSize: ".82rem",
                  border: `1px solid ${active ? "var(--gold)" : "transparent"}`,
                  background: active ? "var(--gold-soft)" : "transparent",
                  color: active ? "var(--gold)" : "var(--text)", cursor: "pointer", textAlign: "left",
                }}>
                {disc}% or more
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}
