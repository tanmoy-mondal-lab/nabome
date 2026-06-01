import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SEO from "../components/SEO";
import { supabase } from "../lib/supabase";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
} from "../lib/db";
import type { Product } from "../data/products";

type FormMode = "add" | "edit";
type Tab = "dashboard" | "products" | "orders";

const emptyForm = {
  name: "",
  price: "",
  originalPrice: "",
  description: "",
  image: "",
  category: "Unisex" as string,
  sizes: "",
  colors: "",
  stock: "10",
  isNew: false,
  isBestSeller: false,
  isLimited: false,
  tags: "",
  material: "",
  fit: "",
  rating: "0",
  reviews: "0",
  bengaliName: "",
  bengaliDescription: "",
};

const categories = ["Men", "Women", "Unisex", "Accessories"];

function formToDb(f: typeof emptyForm) {
  const id = `prod-${Date.now()}`;
  return {
    id,
    name: f.name,
    bengali_name: f.bengaliName || null,
    price: parseInt(f.price) || 0,
    original_price: parseInt(f.originalPrice) || null,
    description: f.description || null,
    bengali_description: f.bengaliDescription || null,
    image: f.image || null,
    images: f.image ? [f.image] : [],
    category: f.category,
    sizes: f.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    colors: f.colors.split(",").map((s) => s.trim()).filter(Boolean),
    stock: parseInt(f.stock) || 10,
    in_stock: (parseInt(f.stock) || 10) > 0,
    is_new: f.isNew,
    is_bestseller: f.isBestSeller,
    is_limited: f.isLimited,
    tags: f.tags.split(",").map((s) => s.trim()).filter(Boolean),
    material: f.material || null,
    fit: f.fit || null,
    rating: parseFloat(f.rating) || 0,
    reviews: parseInt(f.reviews) || 0,
  };
}

function productToForm(p: Product): typeof emptyForm {
  return {
    name: p.name,
    price: String(p.price),
    originalPrice: String(p.originalPrice || ""),
    description: p.description || "",
    image: p.image || "",
    category: p.category,
    sizes: (p.sizes || []).join(", "),
    colors: (p.colors || []).join(", "),
    stock: String(p.stock ?? 10),
    isNew: p.isNew || false,
    isBestSeller: p.isBestSeller || false,
    isLimited: p.isLimited || false,
    tags: (p.tags || []).join(", "),
    material: p.material || "",
    fit: p.fit || "",
    rating: String(p.rating || 0),
    reviews: String(p.reviews || 0),
    bengaliName: "",
    bengaliDescription: "",
  };
}

type OrderRow = Record<string, unknown>;

const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function Admin() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [mode, setMode] = useState<FormMode | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) return false;

      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return false;

      const email = data.session.user.email || "";
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

      // Check profile role first
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .single();

      if (profile?.role === "admin") {
        setUser({ email });
        return true;
      }

      // Fallback to env var check
      if (adminEmail && email === adminEmail) {
        setUser({ email });
        return true;
      }

      return false;
    }

    async function init() {
      const authed = await checkAuth();
      if (!authed) {
        setLoading(false);
        return;
      }

      const [prods, ords] = await Promise.all([
        getProducts(),
        getAllOrders(),
      ]);
      setProducts(prods);
      setOrders(ords as OrderRow[]);
      setLoading(false);
    }

    init();
  }, []);

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startAdd() {
    setMode("add");
    setEditId(null);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(p: Product) {
    setMode("edit");
    setEditId(p.id.toString());
    setForm(productToForm(p));
    setError("");
  }

  function cancelForm() {
    setMode(null);
    setEditId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      setError("Name and price are required.");
      return;
    }

    setSaving(true);
    setError("");

    const dbData = formToDb(form);

    if (!supabase) {
      setError("Set up Supabase first (add .env).");
      setSaving(false);
      return;
    }

    if (mode === "add") {
      const result = await createProduct(dbData);
      if (!result) {
        setError("Failed to save. Check console.");
        setSaving(false);
        return;
      }
    } else if (mode === "edit" && editId) {
      const result = await updateProduct(editId, dbData);
      if (!result) {
        setError("Failed to update. Check console.");
        setSaving(false);
        return;
      }
    }

    const prods = await getProducts();
    setProducts(prods);
    setSaving(false);
    cancelForm();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) return;

    if (!supabase) {
      setError("Supabase not configured.");
      return;
    }

    await deleteProduct(id);
    const prods = await getProducts();
    setProducts(prods);
  }

  async function handleStatusChange(billNo: string, status: string) {
    await updateOrderStatus(billNo, status);
    const ords = await getAllOrders();
    setOrders(ords as OrderRow[]);
  }

  const statusColor: Record<string, string> = {
    pending: "#f39c12",
    confirmed: "#3498db",
    processing: "#9b59b6",
    shipped: "#2ecc71",
    delivered: "#27ae60",
    cancelled: "#e74c3c",
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "50%" }} />
        </div>
      </>
    );
  }

  if (!supabase) {
    return (
      <>
        <Navbar />
        <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", padding: "120px 6%" }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 300 }}>Admin Panel</h1>
          <div style={{ marginTop: 40, padding: 40, border: "1px solid var(--gold)", background: "var(--surface)" }}>
            <h2 style={{ color: "var(--gold)", marginBottom: 16 }}>Supabase required</h2>
            <p style={{ lineHeight: 1.8 }}>
              To manage products, you need a Supabase database. Create a <strong>.env</strong> file in the project root with:
            </p>
            <pre style={{ background: "#111", padding: 20, marginTop: 16, borderRadius: 4, fontSize: ".85rem" }}>
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
            </pre>
            <p style={{ marginTop: 16, lineHeight: 1.8 }}>
              Then run the schema from <strong>src/supabase-schema.sql</strong> in Supabase SQL Editor.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", padding: "120px 6%", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 300 }}>Admin Panel</h1>
          <div style={{ marginTop: 30, padding: 40, border: "1px solid var(--line)", background: "var(--surface)", maxWidth: 500, margin: "30px auto 0" }}>
            <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
              You must be logged in as the store owner to access this page.
            </p>
            <Link to="/login" style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "underline" }}>
              Login as admin
            </Link>
          </div>
        </div>
      </>
    );
  }

  const inputS = {
    width: "100%",
    padding: "12px",
    border: "1px solid var(--line)",
    background: "rgba(255,255,255,0.06)",
    color: "var(--text)",
    outline: "none",
    fontSize: ".9rem",
  } as const;

  return (
    <>
      <Navbar />
      <SEO title="Admin | নবME" description="Store admin panel." path="/admin" />

      <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        <section style={{ padding: "100px 6% 50px", borderBottom: "1px solid var(--line)" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: 3, color: "var(--muted)", fontSize: ".85rem" }}>
            Admin — {user.email}
          </p>
          <h1 style={{ fontSize: "clamp(3rem,6vw,5rem)", fontWeight: 300, marginTop: 15 }}>Dashboard</h1>

          {/* TABS */}
          <div style={{ display: "flex", gap: 4, marginTop: 30 }}>
            {(["dashboard", "products", "orders"] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setMode(null); }} style={{
                padding: "12px 28px",
                border: "none",
                background: tab === t ? "var(--gold)" : "var(--surface)",
                color: tab === t ? "#050505" : "var(--muted)",
                cursor: "pointer",
                fontWeight: 600,
                textTransform: "capitalize",
              }}>
                {t === "dashboard" ? "Overview" : t} {t !== "dashboard" && `(${t === "products" ? products.length : orders.length})`}
              </button>
            ))}
          </div>
        </section>

        <section style={{ padding: "60px 6%" }}>
          {/* ─── DASHBOARD TAB ─── */}
          {tab === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
                {[
                  ["Total Products", String(products.length), "var(--gold)"],
                  ["Total Orders", String(orders.length), "#3498db"],
                  ["Revenue", `₹${orders.reduce((sum, o) => sum + ((o.total as number) || 0), 0).toLocaleString("en-IN")}`, "#2ecc71"],
                  ["Pending Orders", String(orders.filter((o) => (o.order_status as string) === "pending").length), "#f39c12"],
                  ["Delivered", String(orders.filter((o) => (o.order_status as string) === "delivered").length), "#27ae60"],
                  ["Cancelled", String(orders.filter((o) => (o.order_status as string) === "cancelled").length), "#e74c3c"],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ border: "1px solid var(--line)", padding: 28, background: "var(--surface)", textAlign: "center" }}>
                    <p style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: 12 }}>{label}</p>
                    <p style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 300, color }}>{value}</p>
                  </div>
                ))}
              </div>
              <div style={{ border: "1px solid var(--line)", padding: 28, background: "var(--surface)" }}>
                <h3 style={{ fontWeight: 400, marginBottom: 16 }}>Recent Orders</h3>
                {orders.slice(0, 5).length === 0 && <p style={{ color: "var(--muted)" }}>No orders yet.</p>}
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id as string} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ color: "var(--gold)" }}>#{o.bill_no as string}</span>
                    <span style={{ color: "var(--muted)" }}>₹{(o.total as number) || 0}</span>
                    <span style={{ color: statusColor[o.order_status as string] || "#666" }}>{(o.order_status as string) || "pending"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PRODUCTS TAB ─── */}
          {tab === "products" && (
            <>
              {!mode && (
                <button onClick={startAdd} style={{ padding: "16px 32px", border: "none", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 700, fontSize: "1rem", marginBottom: 40 }}>
                  + Add New Product
                </button>
              )}

              {mode && (
                <div style={{ border: "1px solid var(--gold)", padding: 40, background: "var(--surface)", marginBottom: 40 }}>
                  <h2 style={{ marginBottom: 30, color: "var(--gold)" }}>{mode === "add" ? "Add Product" : "Edit Product"}</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
                    {[
                      ["name", "Name *"], ["bengaliName", "Bengali Name"], ["price", "Price (₹) *"],
                      ["originalPrice", "Original Price (₹)"], ["image", "Image URL"], ["stock", "Stock"],
                      ["sizes", "Sizes (comma separated)"], ["colors", "Colors (comma separated)"],
                      ["material", "Material"], ["fit", "Fit"],
                      ["tags", "Tags (comma separated)"], ["rating", "Rating (0-5)"], ["reviews", "Review Count"],
                    ].map(([key, label]) => (
                      <div key={key}>
                        <label style={{ color: "var(--muted)", fontSize: ".8rem", display: "block", marginBottom: 4 }}>{label}</label>
                        <input value={form[key as keyof typeof form] as string} onChange={(e) => update(key as keyof typeof form, e.target.value)} style={inputS} />
                      </div>
                    ))}
                    <div>
                      <label style={{ color: "var(--muted)", fontSize: ".8rem", display: "block", marginBottom: 4 }}>Category</label>
                      <select value={form.category} onChange={(e) => update("category", e.target.value)} style={inputS}>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ color: "var(--muted)", fontSize: ".8rem", display: "block", marginBottom: 4 }}>Description</label>
                      <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} style={{ ...inputS, resize: "none" }} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ color: "var(--muted)", fontSize: ".8rem", display: "block", marginBottom: 4 }}>Bengali Description</label>
                      <textarea rows={3} value={form.bengaliDescription} onChange={(e) => update("bengaliDescription", e.target.value)} style={{ ...inputS, resize: "none" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
                    {(["isNew", "isBestSeller", "isLimited"] as const).map((key) => (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={form[key]} onChange={(e) => update(key, e.target.checked)} />
                        {key === "isNew" ? "New" : key === "isBestSeller" ? "Best Seller" : "Limited"}
                      </label>
                    ))}
                  </div>

                  {error && <p style={{ color: "#e74c3c", marginTop: 16 }}>{error}</p>}

                  <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <button onClick={handleSave} disabled={saving} style={{ padding: "14px 28px", border: "none", background: saving ? "var(--surface-strong)" : "var(--gold)", color: saving ? "var(--muted)" : "#050505", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}>
                      {saving ? "Saving..." : "Save Product"}
                    </button>
                    <button onClick={cancelForm} style={{ padding: "14px 28px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gap: 16 }}>
                <h2 style={{ fontWeight: 400, marginBottom: 10 }}>{products.length} Product{products.length !== 1 ? "s" : ""}</h2>
                {products.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 20, border: "1px solid var(--line)", padding: "16px 24px", background: "var(--surface)" }}>
                    {p.image && <img src={p.image} alt="" style={{ width: 60, height: 60, objectFit: "cover", background: "#111" }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</h4>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                        ₹{p.price}{p.originalPrice ? ` (was ₹${p.originalPrice})` : ""} · {p.category} · Stock: {p.stock}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => startEdit(p)} style={{ padding: "8px 18px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 600, fontSize: ".85rem" }}>Edit</button>
                      <button onClick={() => handleDelete(String(p.id))} style={{ padding: "8px 18px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", fontWeight: 600, fontSize: ".85rem" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ─── ORDERS TAB ─── */}
          {tab === "orders" && (
            <div>
              <h2 style={{ fontWeight: 400, marginBottom: 20 }}>{orders.length} Order{orders.length !== 1 ? "s" : ""}</h2>
              {orders.length === 0 && <p style={{ color: "var(--muted)" }}>No orders yet.</p>}

              {orders.map((o) => (
                <div key={o.id as string} style={{ border: "1px solid var(--line)", padding: 20, background: "var(--surface)", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <strong style={{ color: "var(--gold)" }}>#{o.bill_no as string}</strong>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 4 }}>
                        {(o.customer_snapshot as Record<string, string>)?.name || "N/A"} · ₹{(o.total as number) || 0} · {o.payment_method as string}
                      </p>
                      <p style={{ color: "var(--muted)", fontSize: ".8rem" }}>
                        {new Date(o.created_at as string).toLocaleDateString("en-IN")} · {o.user_email as string || "guest"}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <select
                        value={o.order_status as string}
                        onChange={(e) => handleStatusChange(o.bill_no as string, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          border: `1px solid ${statusColor[o.order_status as string] || "#666"}`,
                          background: "var(--surface)",
                          color: "var(--text)",
                          fontSize: ".85rem",
                        }}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} style={{ color: statusColor[s] }}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                    {(o.items as Array<Record<string, unknown>>)?.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", color: "var(--muted)", padding: "4px 0" }}>
                        <span>{item.name as string} x{item.quantity as number}</span>
                        <span>₹{(item.price as number) * (item.quantity as number)}</span>
                      </div>
                    ))}
                  </div>
                  {(o.utr as string) && <p style={{ marginTop: 8, fontSize: ".8rem", color: "var(--muted)" }}>UTR: {o.utr as string}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
