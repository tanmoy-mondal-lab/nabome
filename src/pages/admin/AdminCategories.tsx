import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3X3, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "../../components/Toast";
import { generateMockAdminCategories } from "../../lib/mockAdminData";
import type { AdminCategory, AdminSubcategory } from "../../types/admin";

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [addingSub, setAddingSub] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [subForm, setSubForm] = useState({ name: "" });
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ name: "", description: "" });

  useEffect(() => { setCategories(generateMockAdminCategories()); }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleEditCategory = (cat: AdminCategory) => {
    setEditingCat(cat.id);
    setEditForm({ name: cat.name, description: cat.description });
  };

  const handleSaveCategory = (id: string) => {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: editForm.name, description: editForm.description } : c));
    showToast("Category updated!");
    setEditingCat(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (!window.confirm("Delete this category and all its subcategories?")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast("Category deleted.");
  };

  const handleAddSubcategory = (catId: string) => {
    if (!subForm.name.trim()) return;
    const newSub: AdminSubcategory = { id: `sub_${Date.now()}`, name: subForm.name.trim(), slug: subForm.name.toLowerCase().replace(/ /g, "-"), productCount: 0 };
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, subcategories: [...c.subcategories, newSub] } : c));
    showToast("Subcategory added!");
    setSubForm({ name: "" });
    setAddingSub(null);
  };

  const handleDeleteSubcategory = (catId: string, subId: string) => {
    setCategories((prev) => prev.map((c) => c.id === catId ? { ...c, subcategories: c.subcategories.filter((s) => s.id !== subId) } : c));
    showToast("Subcategory deleted.");
  };

  const handleCreateCategory = () => {
    if (!newCatForm.name.trim()) return;
    const newCat: AdminCategory = { id: `cat_${Date.now()}`, name: newCatForm.name.trim(), slug: newCatForm.name.toLowerCase().replace(/ /g, "-"), description: newCatForm.description.trim(), image: "", subcategories: [], productCount: 0, isActive: true };
    setCategories((prev) => [...prev, newCat]);
    showToast("Category created!");
    setNewCatForm({ name: "", description: "" });
    setNewCatOpen(false);
  };

  const fieldS: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: ".85rem", outline: "none", borderRadius: "var(--radius)",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 400, display: "flex", alignItems: "center", gap: 10 }}>
          <Grid3X3 size={22} style={{ color: "var(--gold)" }} /> Category Management
        </h1>
        <button onClick={() => setNewCatOpen(!newCatOpen)} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 20px", fontSize: ".82rem" }}>
          <Plus size={14} /> {newCatOpen ? "Cancel" : "Add Category"}
        </button>
      </div>

      {/* New Category Form */}
      {newCatOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 24, borderRadius: "var(--radius-xl)", marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 16 }}>Create New Category</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input type="text" placeholder="Category Name" value={newCatForm.name} onChange={(e) => setNewCatForm((f) => ({ ...f, name: e.target.value }))} style={fieldS} />
            <textarea rows={3} placeholder="Description" value={newCatForm.description} onChange={(e) => setNewCatForm((f) => ({ ...f, description: e.target.value }))} style={{ ...fieldS, resize: "vertical" }} />
            <button onClick={handleCreateCategory} className="premium-button" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 24px", alignSelf: "flex-start", fontSize: ".85rem" }}>
              <Save size={14} /> Create Category
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {categories.map((cat) => (
          <div key={cat.id} className="glass" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", cursor: "pointer" }}
              onClick={() => toggleExpand(cat.id)}>
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--surface-strong)", flexShrink: 0 }}>
                {cat.image && <img src={cat.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div style={{ flex: 1 }}>
                {editingCat === cat.id ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} style={{ ...fieldS, width: 200 }} />
                    <input type="text" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} style={{ ...fieldS, width: 300 }} />
                    <button onClick={() => handleSaveCategory(cat.id)} className="premium-button" style={{ padding: "0 14px", fontSize: ".78rem", display: "flex", alignItems: "center", gap: 4 }}><Save size={12} /> Save</button>
                    <button onClick={() => setEditingCat(null)} style={{ padding: "6px 10px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}><X size={12} /></button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{cat.name}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".78rem" }}>{cat.productCount} products {cat.description ? `· ${cat.description.slice(0, 60)}...` : ""}</p>
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }} style={{ width: 30, height: 30, border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}><Edit2 size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} style={{ width: 30, height: 30, border: "1px solid var(--line)", background: "transparent", color: "#e74c3c", cursor: "pointer", borderRadius: "var(--radius)", display: "grid", placeItems: "center" }}><Trash2 size={12} /></button>
                <span style={{ color: "var(--muted)", display: "grid", placeItems: "center" }}>{expanded.includes(cat.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
              </div>
            </div>

            {/* Subcategories */}
            {expanded.includes(cat.id) && (
              <div style={{ borderTop: "1px solid var(--line)", padding: "12px 20px 16px 68px" }}>
                {cat.subcategories.map((sub) => (
                  <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <span style={{ fontSize: ".85rem", fontWeight: 500 }}>{sub.name}</span>
                      <span style={{ color: "var(--muted)", fontSize: ".75rem", marginLeft: 8 }}>({sub.productCount} products)</span>
                    </div>
                    <button onClick={() => handleDeleteSubcategory(cat.id, sub.id)} style={{ width: 26, height: 26, border: "none", background: "transparent", color: "#e74c3c", cursor: "pointer", display: "grid", placeItems: "center" }}><Trash2 size={12} /></button>
                  </div>
                ))}
                {addingSub === cat.id ? (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input type="text" placeholder="Subcategory name" value={subForm.name} onChange={(e) => setSubForm({ name: e.target.value })}
                      style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", borderRadius: "var(--radius)", fontSize: ".82rem", outline: "none" }}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory(cat.id)} />
                    <button onClick={() => handleAddSubcategory(cat.id)} className="premium-button" style={{ padding: "0 14px", fontSize: ".78rem" }}>Add</button>
                    <button onClick={() => setAddingSub(null)} style={{ padding: "0 12px", border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)" }}><X size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => { setAddingSub(cat.id); setSubForm({ name: "" }); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "6px 12px", border: "1px dashed var(--line)", background: "transparent", color: "var(--muted)", cursor: "pointer", borderRadius: "var(--radius)", fontSize: ".78rem" }}>
                    <Plus size={12} /> Add Subcategory
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
