import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api/admin";
import { sectionRegistry } from "../../../cms/core/section-registry";
import { type PageSection, type SectionType, type SectionField } from "../../../cms/core/cms-types";
import { MediaPicker } from "../../common/MediaPicker";
import { Upload, Loader2 } from "lucide-react";

interface SectionEditorProps {
  section: PageSection;
  onSave: (section: PageSection) => void;
  onCancel: () => void;
}

function VideoField({
  field, value, onChange,
}: {
  field: SectionField; value: string; onChange: (key: string, value: unknown) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (file.size > 100 * 1024 * 1024) { setError("File exceeds 100MB limit"); return; }
    setError(""); setUploading(true);
    try {
      const res = await adminApi.uploadFile(file, "page-builder");
      onChange(field.key, res.url);
    } catch { setError("Upload failed"); }
    finally { setUploading(false); }
  }, [field.key, onChange]);

  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="text" value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder="Paste video URL or upload"
          className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 whitespace-nowrap transition-colors"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
      {value && (
        <video src={value} controls className="w-full max-h-40 mt-2 rounded border border-neutral-200" />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0]; if (file) handleUpload(file);
        if (fileRef.current) fileRef.current.value = "";
      }} />
    </div>
  );
}

function MultiSelectField({
  field, value, onChange,
}: {
  field: SectionField; value: unknown; onChange: (key: string, value: unknown) => void;
}) {
  const selected = Array.isArray(value) ? value as string[] : [];
  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
      <div className="space-y-1 max-h-40 overflow-y-auto border border-neutral-200 rounded p-2">
        {(field.options ?? []).length === 0 ? (
          <p className="text-xs text-neutral-400">No options defined</p>
        ) : (field.options ?? []).map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer py-0.5">
            <input type="checkbox" checked={selected.includes(opt.value)}
              onChange={(e) => onChange(field.key,
                e.target.checked ? [...selected, opt.value] : selected.filter((v) => v !== opt.value)
              )}
              className="accent-brand-500"
            />
            <span className="text-xs text-neutral-600">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function LinkField({
  field, value, onChange,
}: {
  field: SectionField; value: unknown; onChange: (key: string, value: unknown) => void;
}) {
  const parsed = value && typeof value === "object" ? value as Record<string, string> : {};
  const link = { url: String(parsed.url ?? value ?? ""), text: String(parsed.text ?? "") };
  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
      <div className="space-y-2">
        <input type="text" value={link.url}
          onChange={(e) => {
            const next = { ...link, url: e.target.value };
            onChange(field.key, next.text && next.url ? next : e.target.value);
          }}
          placeholder="https://… or /path"
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <input type="text" value={link.text}
          onChange={(e) => {
            const next = { ...link, text: e.target.value };
            onChange(field.key, next.text && next.url ? next : next.url);
          }}
          placeholder="Link text (optional)"
          className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
    </div>
  );
}

function CollectionSelectField({
  field, value, onChange,
}: {
  field: SectionField; value: unknown; onChange: (key: string, value: unknown) => void;
}) {
  const { data: res } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: () => adminApi.getCollections(),
    staleTime: 1000 * 60 * 10,
  });
  const collections = (res as any)?.collections ?? [];
  const selected = Array.isArray(value) ? value as string[] : value ? [String(value)] : [];

  const handleToggle = (slug: string) => {
    const updated = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    onChange(field.key, updated);
  };

  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
      <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded p-2 space-y-1">
        {!Array.isArray(collections) ? (
          <p className="text-xs text-neutral-400">Loading…</p>
        ) : collections.length === 0 ? (
          <p className="text-xs text-neutral-400">No collections found</p>
        ) : collections.map((c: any) => (
          <label key={c.id} className="flex items-center gap-2 cursor-pointer py-0.5">
            <input type="checkbox" checked={selected.includes(c.slug)}
              onChange={() => handleToggle(c.slug)}
              className="accent-brand-500"
            />
            <span className="text-xs text-neutral-600">{c.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CategorySelectField({
  field, value, onChange,
}: {
  field: SectionField; value: unknown; onChange: (key: string, value: unknown) => void;
}) {
  const { data: res } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminApi.getCategories(),
    staleTime: 1000 * 60 * 10,
  });
  const categories = (res as any)?.categories ?? [];
  const selected = Array.isArray(value) ? value as string[] : value ? [String(value)] : [];

  const handleToggle = (slug: string) => {
    const updated = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    onChange(field.key, updated);
  };

  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
      <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded p-2 space-y-1">
        {!Array.isArray(categories) ? (
          <p className="text-xs text-neutral-400">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="text-xs text-neutral-400">No categories found</p>
        ) : categories.map((c: any) => (
          <label key={c.id} className="flex items-center gap-2 cursor-pointer py-0.5">
            <input type="checkbox" checked={selected.includes(c.slug)}
              onChange={() => handleToggle(c.slug)}
              className="accent-brand-500"
            />
            <span className="text-xs text-neutral-600">{c.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ProductSelectField({
  field, value, onChange,
}: {
  field: SectionField; value: unknown; onChange: (key: string, value: unknown) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: res } = useQuery({
    queryKey: ["admin", "products", "list"],
    queryFn: () => adminApi.getProducts({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });
  const products = Array.isArray((res as any)?.products) ? (res as any).products : [];
  const filtered = search
    ? products.filter((p: any) => (p.name || p.title || "").toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
      <input type="text" value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products…"
        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 mb-1"
      />
      <select
        value={String(value ?? "")}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="">Select product…</option>
        {filtered.map((p: any) => (
          <option key={p.id} value={p.id || p.slug}>{p.name || p.title}</option>
        ))}
      </select>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  depth = 0,
}: {
  field: SectionField;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  depth?: number;
}) {
  if (field.condition && depth === 0) return null;

  switch (field.type) {
    case "text":
      return (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">
            {field.label}
            {field.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <input
            type="text"
            value={String(value ?? field.defaultValue ?? "")}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
          <textarea
            rows={4}
            value={String(value ?? "")}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      );

    case "rich_text":
      return (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
          <textarea
            rows={8}
            value={String(value ?? "")}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="HTML content supported"
          />
        </div>
      );

    case "number":
      return (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
          <input
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      );

    case "boolean":
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(value ?? false)}
            onChange={(e) => onChange(field.key, e.target.checked)}
            className="accent-brand-500"
          />
          <span className="text-xs text-neutral-600">{field.label}</span>
        </label>
      );

    case "select":
      return (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
          <select
            value={String(value ?? "")}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {(field.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    case "color":
      return (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={String(value ?? "#000000")}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-10 h-10 p-0.5 border border-neutral-200 rounded cursor-pointer"
            />
            <input
              type="text"
              value={String(value ?? "")}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono border border-neutral-200 rounded"
            />
          </div>
        </div>
      );

      case "image":
        return (
          <div>
            <MediaPicker
              value={String(value ?? "")}
              onChange={(url: string, publicId?: string) => {
                onChange(field.key, url);
                onChange(field.key + "PublicId", publicId ?? "");
              }}
              label={field.label}
              folder="page-builder"
            />
          </div>
        );

      case "video":
        return <VideoField field={field} value={String(value ?? "")} onChange={onChange} />;

      case "link":
        return <LinkField field={field} value={value} onChange={onChange} />;

      case "multiselect":
        return <MultiSelectField field={field} value={value} onChange={onChange} />;

      case "collections":
        return <CollectionSelectField field={field} value={value} onChange={onChange} />;

      case "categories":
        return <CategorySelectField field={field} value={value} onChange={onChange} />;

      case "products":
        return <ProductSelectField field={field} value={value} onChange={onChange} />;

      case "repeater":
      return (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
          {Array.isArray(value) && (value as Record<string, unknown>[]).map((item, idx) => (
            <div key={idx} className="p-3 bg-neutral-50 rounded border border-neutral-100 mb-2">
              <div className="space-y-2">
                {(field.fields ?? []).map((subField) => (
                  <FieldRenderer
                    key={subField.key}
                    field={subField}
                    value={(item as Record<string, unknown>)[subField.key]}
                    onChange={(key, val) => {
                      const newItems = [...(value as Record<string, unknown>[])];
                      newItems[idx] = { ...newItems[idx], [key]: val };
                      onChange(field.key, newItems);
                    }}
                    depth={depth + 1}
                  />
                ))}
              </div>
              {(value as unknown[]).length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newItems = (value as unknown[]).filter((_, i) => i !== idx);
                    onChange(field.key, newItems);
                  }}
                  className="mt-2 text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const emptyItem: Record<string, unknown> = {};
              for (const f of field.fields ?? []) {
                emptyItem[f.key] = f.defaultValue ?? "";
              }
              onChange(field.key, [...(Array.isArray(value) ? value as unknown[] : []), emptyItem]);
            }}
            className="text-xs text-brand-600 hover:text-brand-700 mt-1"
          >
            + Add Item
          </button>
        </div>
      );

    default:
      return (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">{field.label}</label>
          <input
            type="text"
            value={String(value ?? "")}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      );
  }
}

export function SectionEditor({ section, onSave, onCancel }: SectionEditorProps) {
  const [config, setConfig] = useState<Record<string, unknown>>({ ...section.config });
  const [styles, setStyles] = useState<Record<string, unknown>>(section.styles ?? {});
  const [activeTab, setActiveTab] = useState<"content" | "styles" | "visibility">("content");
  const def = sectionRegistry.get(section.type);

  useEffect(() => {
    setConfig(sectionRegistry.mergeConfig(section.type, section.config));
  }, [section]);

  if (!def) {
    return <div className="text-sm text-red-500">Unknown section type: {section.type}</div>;
  }

  const handleSave = () => {
    onSave({
      ...section,
      config,
      styles: activeTab === "styles" ? styles : section.styles,
    });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-200">
        {(["content", "styles", "visibility"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "text-neutral-900 border-neutral-900"
                : "text-neutral-400 border-transparent hover:text-neutral-600"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {def.fields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={config[field.key]}
              onChange={(key, value) => setConfig((prev) => ({ ...prev, [key]: value }))}
            />
          ))}
        </div>
      )}

      {/* Styles Tab */}
      {activeTab === "styles" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Padding (e.g. 2rem 0)</label>
            <input
              type="text"
              value={String(styles.padding ?? "")}
              onChange={(e) => setStyles((prev) => ({ ...prev, padding: e.target.value }))}
              placeholder="2rem 0"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Margin</label>
            <input
              type="text"
              value={String(styles.margin ?? "")}
              onChange={(e) => setStyles((prev) => ({ ...prev, margin: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Background Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={String(styles.backgroundColor ?? "#ffffff")}
                onChange={(e) => setStyles((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-10 h-10 p-0.5 border border-neutral-200 rounded cursor-pointer"
              />
              <input
                type="text"
                value={String(styles.backgroundColor ?? "")}
                onChange={(e) => setStyles((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm font-mono border border-neutral-200 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Max Width</label>
            <input
              type="text"
              value={String(styles.maxWidth ?? "")}
              onChange={(e) => setStyles((prev) => ({ ...prev, maxWidth: e.target.value }))}
              placeholder="1280px"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Custom CSS Class</label>
            <input
              type="text"
              value={String(styles.customClass ?? "")}
              onChange={(e) => setStyles((prev) => ({ ...prev, customClass: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded"
            />
          </div>
        </div>
      )}

      {/* Visibility Tab */}
      {activeTab === "visibility" && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={section.visibility?.isVisible ?? true}
              onChange={(e) =>
                onSave({
                  ...section,
                  visibility: { ...section.visibility, isVisible: e.target.checked },
                })
              }
              className="accent-brand-500"
            />
            <span className="text-xs text-neutral-600">Visible on site</span>
          </label>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Schedule Start (optional)</label>
            <input
              type="datetime-local"
              value={section.visibility?.schedule?.startDate ?? ""}
              onChange={(e) =>
                onSave({
                  ...section,
                  visibility: {
                    ...section.visibility,
                    schedule: { ...section.visibility?.schedule, startDate: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Schedule End (optional)</label>
            <input
              type="datetime-local"
              value={section.visibility?.schedule?.endDate ?? ""}
              onChange={(e) =>
                onSave({
                  ...section,
                  visibility: {
                    ...section.visibility,
                    schedule: { ...section.visibility?.schedule, endDate: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Visible on Devices</label>
            <div className="flex gap-4 mt-1">
              {(["desktop", "tablet", "mobile"] as const).map((device) => (
                <label key={device} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.visibility?.devices?.includes(device) ?? true}
                    onChange={(e) => {
                      const current = section.visibility?.devices ?? ["desktop", "tablet", "mobile"];
                      const updated = e.target.checked
                        ? [...current, device]
                        : current.filter((d) => d !== device);
                      onSave({ ...section, visibility: { ...section.visibility, devices: updated } });
                    }}
                    className="accent-brand-500"
                  />
                  <span className="text-xs text-neutral-600 capitalize">{device}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800"
        >
          Save Section
        </button>
      </div>
    </div>
  );
}
