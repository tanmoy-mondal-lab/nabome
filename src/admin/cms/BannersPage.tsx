import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/StatusBadge";
import { EmptyState } from "../common/EmptyState";
import { MediaPicker } from "../common/MediaPicker";
import { SafeImage } from "../../components/SafeImage";
import { useToast } from "../../components/ui/Toast";
import { Edit3, Trash2, Plus, Images } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  isActive: boolean;
}

interface HeroSection {
  id: string;
  type: string;
  config: { banners?: Banner[]; [key: string]: unknown };
}

export default function BannersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "hero", isActive: true });

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["admin", "homepage"],
    queryFn: async () => {
      const res = await adminApi.getHomepageSections();
      return (res.sections as HeroSection[]) ?? [];
    },
  });

  const banners = sections
    .filter((s) => s.type === "hero")
    .flatMap((s) => Array.isArray(s.config?.banners) ? (s.config.banners as Banner[]) : []);

  const heroSection = sections.find((s) => s.type === "hero");

  const saveMutation = useMutation({
    mutationFn: async (updatedBanners: Banner[]) => {
      if (heroSection) {
        await adminApi.updateHomeSection(heroSection.id, {
          ...heroSection,
          config: { ...heroSection.config, banners: updatedBanners },
        });
      } else {
        await adminApi.createHomeSection({
          type: "hero",
          sortOrder: 0,
          isActive: true,
          config: { banners: updatedBanners },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
      setModalOpen(false);
      toast(editItem ? "Banner updated" : "Banner created", "success");
    },
    onError: () => toast("Failed to save banner", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (bannerId: string) => {
      const updatedBanners = banners.filter((b) => b.id !== bannerId);
      if (heroSection) {
        await adminApi.updateHomeSection(heroSection.id, {
          ...heroSection,
          config: { ...heroSection.config, banners: updatedBanners },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
      toast("Banner deleted", "success");
    },
    onError: () => toast("Failed to delete banner", "error"),
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "hero", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditItem(banner);
    setForm({ title: banner.title, subtitle: banner.subtitle, imageUrl: banner.imageUrl, linkUrl: banner.linkUrl, position: banner.position, isActive: banner.isActive });
    setModalOpen(true);
  };

  const handleSave = () => {
    let updatedBanners: Banner[];
    if (editItem) {
      updatedBanners = banners.map((b) => b.id === editItem.id ? { ...b, ...form } : b);
    } else {
      updatedBanners = [...banners, { id: `banner-${Date.now()}`, ...form }];
    }
    saveMutation.mutate(updatedBanners);
  };

  const handleDelete = (bannerId: string) => {
    deleteMutation.mutate(bannerId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Banners</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage promotional banners</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Images} title="No banners yet"
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Add Banner</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white border border-neutral-200 rounded overflow-hidden group">
              <div className="aspect-[16/9] bg-neutral-100 relative">
                {banner.imageUrl ? (
                  <SafeImage src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" useTransform={false} />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-300"><Images size={32} /></div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(banner)} className="bg-white p-1.5 rounded shadow text-neutral-600"><Edit3 size={12} /></button>
                  <button onClick={() => handleDelete(banner.id)} className="bg-white p-1.5 rounded shadow text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm text-neutral-900">{banner.title || "Untitled"}</h3>
                  <StatusBadge status={banner.isActive ? "active" : "inactive"} />
                </div>
                <p className="text-xs text-neutral-400 mt-1 capitalize">{banner.position}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Banner" : "New Banner"}>
        <div className="space-y-4">
          <div className="grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Position</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                <option value="hero">Hero</option>
                <option value="promo">Promo Strip</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Subtitle</label>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
          <div>
            <MediaPicker value={form.imageUrl} onChange={(url: string) => setForm({ ...form, imageUrl: url })} label="Image URL" folder="banners" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Link URL</label>
            <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} disabled={saveMutation.isPending}
              className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
