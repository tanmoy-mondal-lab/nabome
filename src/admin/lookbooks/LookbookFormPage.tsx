import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { Plus, X, GripVertical, Image, Link, Package } from "lucide-react";
import { type LookbookItem, type Lookbook } from "../../cms/core/cms-types";

export default function LookbookFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", slug: "", description: "", story: "", season: "",
    year: new Date().getFullYear(), featuredImage: "", layout: "grid" as Lookbook["layout"],
    status: "draft" as Lookbook["status"], tags: "",
    metaTitle: "", metaDescription: "",
  });
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      adminApi.getPage(id!).then((res) => {
        const p = res.page as Record<string, unknown>;
        const data = p.content as Record<string, unknown> ?? {};
        setForm({
          title: p.title as string ?? "",
          slug: p.slug as string ?? "",
          description: data.description as string ?? "",
          story: data.story as string ?? "",
          season: data.season as string ?? "",
          year: (data.year as number) ?? new Date().getFullYear(),
          featuredImage: data.featuredImage as string ?? "",
          layout: (data.layout as Lookbook["layout"]) ?? "grid",
          status: (p.status as Lookbook["status"]) ?? "draft",
          tags: Array.isArray(data.tags) ? (data.tags as string[]).join(", ") : "",
          metaTitle: (p as Record<string, string>).metaTitle ?? "",
          metaDescription: (p as Record<string, string>).metaDescription ?? "",
        });
        setItems((data.items as LookbookItem[]) ?? []);
      }).catch(() => navigate("/admin/lookbooks"));
    }
  }, [id, isEdit, navigate]);

  const addItem = (type: LookbookItem["type"]) => {
    const newItem: LookbookItem = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      type,
      title: "", description: "", mediaUrl: "",
      position: items.length, aspectRatio: 1,
    };
    setItems([...items, newItem]);
    setShowAddItem(false);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof LookbookItem, value: unknown) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        type: "lookbook",
        status: form.status,
        content: {
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          items,
        },
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
      };
      if (isEdit) {
        await adminApi.updatePage(id!, payload);
      } else {
        await adminApi.createPage(payload);
      }
      navigate("/admin/lookbooks");
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">{isEdit ? "Edit Lookbook" : "New Lookbook"}</h1>
        <p className="text-sm text-neutral-500 mt-1">Create a fashion story or editorial lookbook</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900">Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Title *</label>
                <input required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: isEdit ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Slug</label>
                <input value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Season</label>
                <select value={form.season}
                  onChange={(e) => setForm({ ...form, season: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                  <option value="">Select season</option>
                  <option value="Spring/Summer">Spring/Summer</option>
                  <option value="Fall/Winter">Fall/Winter</option>
                  <option value="Pre-Fall">Pre-Fall</option>
                  <option value="Resort">Resort</option>
                  <option value="Festive">Festive</option>
                  <option value="Wedding">Wedding</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Year</label>
                <input type="number" value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Layout</label>
                <select value={form.layout}
                  onChange={(e) => setForm({ ...form, layout: e.target.value as Lookbook["layout"] })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                  <option value="grid">Grid</option>
                  <option value="masonry">Masonry</option>
                  <option value="carousel">Carousel</option>
                  <option value="editorial">Editorial</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Description</label>
              <textarea rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Story / Narrative</label>
              <textarea rows={6} value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" placeholder="Tell the story behind this collection…" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Tags (comma separated)</label>
              <input value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
          </section>

          {/* Lookbook Items */}
          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-sm text-neutral-900">Lookbook Items ({items.length})</h2>
              <div className="relative">
                <button onClick={() => setShowAddItem(!showAddItem)}
                  className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700">
                  <Plus size={14} /> Add Item
                </button>
                {showAddItem && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded shadow-lg z-10 w-48">
                    <button onClick={() => addItem("image")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Image size={14} /> Image
                    </button>
                    <button onClick={() => addItem("video")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Image size={14} /> Video
                    </button>
                    <button onClick={() => addItem("product")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Package size={14} /> Product
                    </button>
                    <button onClick={() => addItem("text")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Link size={14} /> Text Block
                    </button>
                    <button onClick={() => addItem("shop_the_look")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                      <Package size={14} /> Shop The Look
                    </button>
                  </div>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-sm">
                No items yet. Click "Add Item" to start building your lookbook.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-neutral-50 rounded border border-neutral-100">
                    <div className="flex items-center text-neutral-300 cursor-move">
                      <GripVertical size={16} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium px-1.5 py-0.5 bg-white rounded border">
                          {item.type.replace(/_/g, " ")}
                        </span>
                        <input placeholder="Title" value={item.title}
                          onChange={(e) => updateItem(idx, "title", e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded" />
                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                          <X size={12} />
                        </button>
                      </div>
                      {item.type !== "text" && (
                        <input placeholder={item.type === "video" ? "Video URL" : "Image URL"} value={item.mediaUrl}
                          onChange={(e) => updateItem(idx, "mediaUrl", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                      )}
                      {item.type === "text" && (
                        <textarea rows={3} placeholder="Content…" value={item.description}
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                      )}
                      {item.type === "product" && (
                        <input placeholder="Product ID" value={item.productId ?? ""}
                          onChange={(e) => updateItem(idx, "productId", e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-neutral-200 rounded" />
                      )}
                      <div className="flex gap-2">
                        <input placeholder="Link URL" value={item.linkUrl ?? ""}
                          onChange={(e) => updateItem(idx, "linkUrl", e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded" />
                        <input placeholder="Link Text" value={item.linkText ?? ""}
                          onChange={(e) => updateItem(idx, "linkText", e.target.value)}
                          className="w-32 px-2 py-1 text-xs border border-neutral-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900">Publishing</h2>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Status</label>
              <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Lookbook["status"] })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Featured Image URL</label>
              <input value={form.featuredImage}
                onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
          </section>

          <section className="bg-white border border-neutral-200 rounded p-6 space-y-4">
            <h2 className="font-medium text-sm text-neutral-900">SEO</h2>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Meta Title</label>
              <input value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Meta Description</label>
              <textarea rows={3} value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
            </div>
          </section>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-neutral-900 text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
            {saving ? "Saving…" : isEdit ? "Update Lookbook" : "Create Lookbook"}
          </button>
        </div>
      </div>
    </div>
  );
}
