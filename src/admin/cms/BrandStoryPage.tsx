import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { MediaPicker } from "@/admin/common/MediaPicker";
import { useToast } from "@/components/ui/Toast";
import { useFormDirty } from "@/hooks/useFormDirty";

export default function BrandStoryPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    heading: "", subheading: "", body: "", imageUrl: "",
    videoUrl: "", values: [{ title: "", description: "" }],
    metaTitle: "", metaDescription: "",
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { isDirty, markDirty, markClean } = useFormDirty(form);

  useEffect(() => {
    if (isDirty) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [isDirty]);

  useEffect(() => {
    adminApi.getBrandStory().then((res) => {
      const story = res.story as Record<string, unknown> | undefined;
      if (story) {
        setForm({
          heading: (story.title as string) ?? "",
          subheading: (story.subtitle as string) ?? "",
          body: (story.content as string) ?? "",
          imageUrl: (story.heroImageUrl as string) ?? "",
          videoUrl: "",
          values: (story.values as { title: string; description: string }[]) ?? [{ title: "", description: "" }],
          metaTitle: "",
          metaDescription: "",
        });
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const addValue = () => { setForm((prev) => ({ ...prev, values: [...prev.values, { title: "", description: "" }] })); markDirty(); };
  const removeValue = (i: number) => { setForm((prev) => ({ ...prev, values: prev.values.filter((_, idx) => idx !== i) })); markDirty(); };
  const updateValue = (i: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      values: prev.values.map((v, idx) => idx === i ? { ...v, [field]: value } : v),
    }));
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateBrandStory({
        title: form.heading,
        subtitle: form.subheading,
        content: form.body,
        heroImageUrl: form.imageUrl,
        values: form.values,
      });
      toast("Brand story saved", "success");
      markClean();
    } catch {
      toast("Failed to save brand story", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Brand Story</h1>
        <p className="text-sm text-neutral-500 mt-1">Edit the brand story page</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded p-6 space-y-4 max-w-4xl">
        <div className="grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Heading</label>
            <input value={form.heading}
              onChange={(e) => { setForm({ ...form, heading: e.target.value }); markDirty(); }}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subheading</label>
            <input value={form.subheading}
              onChange={(e) => { setForm({ ...form, subheading: e.target.value }); markDirty(); }}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Body</label>
          <textarea rows={6} value={form.body}
            onChange={(e) => { setForm({ ...form, body: e.target.value }); markDirty(); }}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <MediaPicker value={form.imageUrl} onChange={(url: string) => setForm({ ...form, imageUrl: url })} label="Image URL" folder="brand-story" />
          </div>
          <div>
            <MediaPicker value={form.videoUrl} onChange={(url: string) => setForm({ ...form, videoUrl: url })} label="Video URL" folder="brand-story" accept="video/mp4,video/webm,video/quicktime" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-neutral-500">Brand Values</label>
            <button type="button" onClick={addValue} className="text-xs text-brand-600">+ Add</button>
          </div>
          <div className="space-y-2">
            {form.values.map((v, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input placeholder="Title" value={v.title}
                  onChange={(e) => updateValue(i, "title", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
                <input placeholder="Description" value={v.description}
                  onChange={(e) => updateValue(i, "description", e.target.value)}
                  className="flex-[2] px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
                {form.values.length > 1 && (
                  <button onClick={() => removeValue(i)} className="text-red-400 hover:text-red-600 p-2">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Meta Title</label>
            <input value={form.metaTitle}
              onChange={(e) => { setForm({ ...form, metaTitle: e.target.value }); markDirty(); }}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Meta Description</label>
            <input value={form.metaDescription}
              onChange={(e) => { setForm({ ...form, metaDescription: e.target.value }); markDirty(); }}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={saving}
            className="bg-neutral-900 text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-neutral-800 disabled:opacity-50">
            {saving ? "Saving…" : "Save Brand Story"}
          </button>
        </div>
      </div>
    </div>
  );
}
