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
  getAllSiteQuotes,
  createSiteQuote,
  updateSiteQuote,
  deleteSiteQuote,
  type SiteQuote,
} from "../lib/db";
import type { Product } from "../data/products";

type FormMode = "add" | "edit";
type Tab = "dashboard" | "products" | "orders" | "subscribers" | "quotes";

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
const LOW_STOCK_THRESHOLD = 5;

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
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [subscribers, setSubscribers] = useState<Array<Record<string, unknown>>>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [quotes, setQuotes] = useState<SiteQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quoteEditingId, setQuoteEditingId] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({ text: "", attribution: "", is_active: true });

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

  async function loadSubscribers() {
    if (!supabase) return;
    setSubscribersLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setSubscribers(data as Array<Record<string, unknown>>);
    }
    setSubscribersLoading(false);
  }

  async function loadQuotes() {
    if (!supabase) return;
    setQuotesLoading(true);
    const data = await getAllSiteQuotes();
    setQuotes(data);
    setQuotesLoading(false);
  }

  async function handleSaveQuote() {
    if (!quoteForm.text || !quoteForm.attribution) {
      setError("Quote text and attribution are required.");
      return;
    }
    setSaving(true);
    setError("");
    if (quoteEditingId) {
      await updateSiteQuote(quoteEditingId, quoteForm);
    } else {
      await createSiteQuote({
        text: quoteForm.text,
        attribution: quoteForm.attribution,
        is_active: quoteForm.is_active,
        sort_order: quotes.length,
      });
    }
    setQuoteForm({ text: "", attribution: "", is_active: true });
    setQuoteEditingId(null);
    await loadQuotes();
    setSaving(false);
  }

  function startEditQuote(q: SiteQuote) {
    setQuoteEditingId(q.id);
    setQuoteForm({ text: q.text, attribution: q.attribution, is_active: q.is_active });
    setError("");
  }

  function cancelQuoteForm() {
    setQuoteEditingId(null);
    setQuoteForm({ text: "", attribution: "", is_active: true });
    setError("");
  }

  async function handleDeleteQuote(id: string) {
    if (!window.confirm("Delete this quote?")) return;
    await deleteSiteQuote(id);
    await loadQuotes();
  }

  function exportSubscribersCSV() {
    if (subscribers.length === 0) return;
    const header = "email,subscribed_at\n";
    const rows = subscribers.map((s) => {
      const email = (s.email as string) || "";
      const date = s.created_at ? new Date(s.created_at as string).toISOString() : "";
      return `${email},${date}`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nabome-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportOrdersCSV() {
    if (orders.length === 0) return;
    const header = "bill_no,date,customer,email,phone,total,status,utr\n";
    const rows = orders.map((o) => {
      const customer = o.customer_snapshot as Record<string, string> | undefined;
      return [
        o.bill_no,
        o.created_at ? new Date(o.created_at as string).toISOString() : "",
        customer?.name || "",
        o.user_email || "",
        customer?.phone || "",
        o.total || 0,
        o.order_status || "",
        o.utr || "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nabome-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          <div style={{ display: "flex", gap: 4, marginTop: 30, flexWrap: "wrap" }}>
            {(["dashboard", "products", "orders", "subscribers", "quotes"] as Tab[]).map((t) => (
              <button key={t} onClick={() => { setTab(t); setMode(null); if (t === "subscribers") loadSubscribers(); if (t === "quotes") loadQuotes(); }} style={{
                padding: "12px 28px",
                border: "none",
                background: tab === t ? "var(--gold)" : "var(--surface)",
                color: tab === t ? "#050505" : "var(--muted)",
                cursor: "pointer",
                fontWeight: 600,
                textTransform: "capitalize",
              }}>
                {t === "dashboard" ? "Overview" : t} {t !== "dashboard" && `(${t === "products" ? products.length : t === "orders" ? orders.length : t === "subscribers" ? subscribers.length : quotes.length})`}
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

              {/* LOW STOCK ALERTS */}
              {products.filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD).length > 0 && (
                <div style={{ border: "1px solid #e74c3c", padding: 28, background: "var(--surface)", marginBottom: 30 }}>
                  <h3 style={{ fontWeight: 400, marginBottom: 16, color: "#e74c3c" }}>⚠ Low Stock Alert ({products.filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD).length})</h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    {products.filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD).map((p) => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.2)" }}>
                        <span style={{ fontSize: ".9rem" }}>{p.name}</span>
                        <span style={{ color: (p.stock ?? 0) === 0 ? "#e74c3c" : "#f39c12", fontWeight: 600, fontSize: ".85rem" }}>
                          {(p.stock ?? 0) === 0 ? "OUT OF STOCK" : `${p.stock} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ border: "1px solid var(--line)", padding: 28, background: "var(--surface)" }}>
                <h3 style={{ fontWeight: 400, marginBottom: 16 }}>Recent Orders</h3>
                {orders.slice(0, 5).length === 0 && <p style={{ color: "var(--muted)" }}>No orders yet.</p>}
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id as string} onClick={() => setSelectedOrder(o)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 30 }}>
                  <button onClick={startAdd} style={{ padding: "14px 28px", border: "none", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}>
                    + Add New Product
                  </button>
                  <input
                    type="search"
                    placeholder="Search products by name, category, tags..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{
                      ...inputS,
                      maxWidth: 360,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  />
                </div>
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
                <h2 style={{ fontWeight: 400, marginBottom: 10 }}>
                  {products.filter((p) => {
                    if (!productSearch) return true;
                    const q = productSearch.toLowerCase();
                    return p.name.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q) ||
                      (p.tags || []).some((t) => t.toLowerCase().includes(q));
                  }).length} Product{products.length !== 1 ? "s" : ""}
                </h2>
                {products
                  .filter((p) => {
                    if (!productSearch) return true;
                    const q = productSearch.toLowerCase();
                    return p.name.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q) ||
                      (p.tags || []).some((t) => t.toLowerCase().includes(q));
                  })
                  .map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 20, border: "1px solid var(--line)", padding: "16px 24px", background: "var(--surface)" }}>
                    {p.image && <img src={p.image} alt="" style={{ width: 60, height: 60, objectFit: "cover", background: "#111" }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</h4>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                        ₹{p.price}{p.originalPrice ? ` (was ₹${p.originalPrice})` : ""} · {p.category} ·{" "}
                        <span style={{ color: (p.stock ?? 0) === 0 ? "#e74c3c" : (p.stock ?? 0) <= LOW_STOCK_THRESHOLD ? "#f39c12" : "var(--muted)" }}>
                          Stock: {p.stock}
                        </span>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <h2 style={{ fontWeight: 400 }}>{orders.length} Order{orders.length !== 1 ? "s" : ""}</h2>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} style={{ ...inputS, maxWidth: 180 }}>
                    <option value="all">All Statuses</option>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    type="search"
                    placeholder="Search by bill no, name, email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ ...inputS, maxWidth: 320 }}
                  />
                </div>
              </div>
              {orders.length === 0 && <p style={{ color: "var(--muted)" }}>No orders yet.</p>}

              {orders
                .filter((o) => {
                  if (orderStatusFilter !== "all" && (o.order_status as string) !== orderStatusFilter) return false;
                  if (!orderSearch) return true;
                  const q = orderSearch.toLowerCase();
                  const customer = o.customer_snapshot as Record<string, string> | undefined;
                  return (o.bill_no as string)?.toLowerCase().includes(q) ||
                    customer?.name?.toLowerCase().includes(q) ||
                    (o.user_email as string)?.toLowerCase().includes(q) ||
                    customer?.phone?.toLowerCase().includes(q);
                })
                .map((o) => {
                  const customer = o.customer_snapshot as Record<string, string> | undefined;
                  return (
                <div key={o.id as string} style={{ border: "1px solid var(--line)", padding: 20, background: "var(--surface)", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <strong style={{ color: "var(--gold)" }}>#{o.bill_no as string}</strong>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem", marginTop: 4 }}>
                        {customer?.name || "N/A"} · ₹{(o.total as number) || 0} · {o.payment_method as string}
                      </p>
                      <p style={{ color: "var(--muted)", fontSize: ".8rem" }}>
                        {new Date(o.created_at as string).toLocaleDateString("en-IN")} · {o.user_email as string || "guest"}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => setSelectedOrder(o)} style={{ padding: "6px 14px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", fontSize: ".8rem" }}>
                        Details
                      </button>
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
                  );
                })}
            </div>
          )}

          {/* ─── SUBSCRIBERS TAB ─── */}
          {tab === "subscribers" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <h2 style={{ fontWeight: 400 }}>{subscribers.length} Subscriber{subscribers.length !== 1 ? "s" : ""}</h2>
                {subscribers.length > 0 && (
                  <button onClick={exportSubscribersCSV} style={{ padding: "12px 24px", border: "none", background: "var(--gold)", color: "#050505", cursor: "pointer", fontWeight: 600, fontSize: ".9rem" }}>
                    Export CSV
                  </button>
                )}
              </div>
              {subscribersLoading && <p style={{ color: "var(--muted)" }}>Loading subscribers...</p>}
              {!subscribersLoading && subscribers.length === 0 && (
                <p style={{ color: "var(--muted)" }}>No newsletter subscribers yet. Visitors can subscribe from the footer.</p>
              )}
              <div style={{ display: "grid", gap: 8 }}>
                {subscribers.map((s) => (
                  <div key={s.id as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--line)", padding: "14px 20px", background: "var(--surface)" }}>
                    <span style={{ fontSize: ".95rem" }}>{s.email as string}</span>
                    <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                      {s.created_at ? new Date(s.created_at as string).toLocaleDateString("en-IN") : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── QUOTES TAB ─── */}
          {tab === "quotes" && (
            <div>
              <div style={{ border: "1px solid var(--gold)", padding: 32, background: "var(--surface)", marginBottom: 30 }}>
                <h2 style={{ marginBottom: 20, color: "var(--gold)" }}>{quoteEditingId ? "Edit Quote" : "Add New Quote"}</h2>
                <p style={{ color: "var(--muted)", marginBottom: 20, fontSize: ".9rem" }}>
                  These Bengali/cultural quotes appear in the rotating quote banner on the homepage. Visitors see them every 5 seconds.
                </p>
                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={{ color: "var(--muted)", fontSize: ".8rem", display: "block", marginBottom: 4 }}>Quote Text (Bengali or English) *</label>
                    <textarea
                      rows={3}
                      value={quoteForm.text}
                      onChange={(e) => setQuoteForm((f) => ({ ...f, text: e.target.value }))}
                      style={{ ...inputS, resize: "vertical", fontFamily: "inherit" }}
                      placeholder="আমার সোনার বাংলা..."
                    />
                  </div>
                  <div>
                    <label style={{ color: "var(--muted)", fontSize: ".8rem", display: "block", marginBottom: 4 }}>Attribution *</label>
                    <input
                      value={quoteForm.attribution}
                      onChange={(e) => setQuoteForm((f) => ({ ...f, attribution: e.target.value }))}
                      style={inputS}
                      placeholder="Rabindranath Tagore"
                    />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text)" }}>
                    <input
                      type="checkbox"
                      checked={quoteForm.is_active}
                      onChange={(e) => setQuoteForm((f) => ({ ...f, is_active: e.target.checked }))}
                    />
                    <span style={{ fontSize: ".9rem" }}>Active (visible on site)</span>
                  </label>
                </div>
                {error && <p style={{ color: "#e74c3c", marginTop: 12 }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button
                    onClick={handleSaveQuote}
                    disabled={saving}
                    style={{ padding: "12px 24px", border: "none", background: saving ? "var(--surface-strong)" : "var(--gold)", color: saving ? "var(--muted)" : "#050505", cursor: saving ? "not-allowed" : "pointer", fontWeight: 600 }}
                  >
                    {saving ? "Saving..." : quoteEditingId ? "Update Quote" : "Add Quote"}
                  </button>
                  {quoteEditingId && (
                    <button onClick={cancelQuoteForm} style={{ padding: "12px 24px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", fontWeight: 600 }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <h2 style={{ fontWeight: 400, marginBottom: 16 }}>{quotes.length} Quote{quotes.length !== 1 ? "s" : ""}</h2>
              {quotesLoading && <p style={{ color: "var(--muted)" }}>Loading quotes...</p>}
              {!quotesLoading && quotes.length === 0 && (
                <p style={{ color: "var(--muted)" }}>No quotes yet. Add one above to get started.</p>
              )}
              <div style={{ display: "grid", gap: 12 }}>
                {quotes.map((q) => (
                  <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: 16, border: `1px solid ${q.is_active ? "var(--line)" : "rgba(231,76,60,0.3)"}`, padding: "16px 20px", background: "var(--surface)", opacity: q.is_active ? 1 : 0.6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "1rem", lineHeight: 1.6, marginBottom: 8 }}>{q.text}</p>
                      <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                        — {q.attribution} {q.is_active ? "" : <span style={{ color: "#e74c3c", marginLeft: 8 }}>(HIDDEN)</span>}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => updateSiteQuote(q.id, { is_active: !q.is_active }).then(() => loadQuotes())}
                        style={{ padding: "6px 12px", border: "1px solid var(--line)", background: "transparent", color: "var(--text)", cursor: "pointer", fontSize: ".8rem" }}
                      >
                        {q.is_active ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => startEditQuote(q)} style={{ padding: "6px 12px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontSize: ".8rem" }}>Edit</button>
                      <button onClick={() => handleDeleteQuote(q.id)} style={{ padding: "6px 12px", border: "1px solid #e74c3c", background: "transparent", color: "#e74c3c", cursor: "pointer", fontSize: ".8rem" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ORDERS EXPORT BUTTON ─── */}
          {tab === "orders" && orders.length > 0 && (
            <div style={{ marginTop: 30, textAlign: "right" }}>
              <button onClick={exportOrdersCSV} style={{ padding: "12px 24px", border: "1px solid var(--gold)", background: "transparent", color: "var(--gold)", cursor: "pointer", fontWeight: 600, fontSize: ".9rem" }}>
                Export Orders CSV
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ─── ORDER DETAIL MODAL ─── */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 1000, padding: 20, overflowY: "auto" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg)", border: "1px solid var(--gold)", maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <p style={{ color: "var(--muted)", fontSize: ".85rem", textTransform: "uppercase", letterSpacing: 2 }}>Order</p>
                <h2 style={{ color: "var(--gold)", fontSize: "1.6rem", fontWeight: 400, marginTop: 6 }}>#{selectedOrder.bill_no as string}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} aria-label="Close" style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--text)", width: 36, height: 36, cursor: "pointer", fontSize: "1.1rem" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {[
                ["Date", selectedOrder.created_at ? new Date(selectedOrder.created_at as string).toLocaleString("en-IN") : "—"],
                ["Status", selectedOrder.order_status as string || "pending"],
                ["Payment", selectedOrder.payment_method as string || "—"],
                ["UTR", (selectedOrder.utr as string) || "—"],
                ["Customer Email", (selectedOrder.user_email as string) || "guest"],
                ["Total", `₹${(selectedOrder.total as number) || 0}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ color: "var(--muted)", fontSize: ".75rem", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: ".95rem" }}>{value}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 400, marginBottom: 12, color: "var(--gold)" }}>Customer Details</h3>
              {(() => {
                const c = selectedOrder.customer_snapshot as Record<string, string> | undefined;
                if (!c) return <p style={{ color: "var(--muted)" }}>No customer info saved.</p>;
                return (
                  <div style={{ display: "grid", gap: 6, color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.7 }}>
                    <p><strong style={{ color: "var(--text)" }}>{c.name || "—"}</strong></p>
                    {c.phone && <p>Phone: {c.phone}</p>}
                    {c.email && <p>Email: {c.email}</p>}
                    {c.address && <p>Address: {c.address}</p>}
                    {c.city && <p>{c.city}{c.state ? `, ${c.state}` : ""} {c.pincode || ""}</p>}
                    {c.customerUpi && <p>UPI: {c.customerUpi}</p>}
                  </div>
                );
              })()}
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 20 }}>
              <h3 style={{ fontWeight: 400, marginBottom: 12, color: "var(--gold)" }}>Items</h3>
              {(selectedOrder.items as Array<Record<string, unknown>>)?.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)", fontSize: ".9rem" }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{item.name as string}</p>
                    <p style={{ color: "var(--muted)", fontSize: ".8rem" }}>
                      {item.selectedSize ? `Size: ${item.selectedSize as string}` : ""}
                      {item.selectedColor ? ` · Color: ${item.selectedColor as string}` : ""}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p>× {item.quantity as number}</p>
                    <p style={{ color: "var(--muted)" }}>₹{((item.price as number) * (item.quantity as number)).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: "1rem", fontWeight: 600 }}>
                <span>Total</span>
                <span style={{ color: "var(--gold)" }}>₹{(selectedOrder.total as number || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
