import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, Menu as MenuIcon } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

interface NavMenu {
  id: string;
  name: string;
  location: string;
  items: NavItem[];
  isActive: boolean;
}

interface NavItem {
  label: string;
  url: string;
  children?: NavItem[];
}

export default function NavigationBuilder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<NavMenu | null>(null);
  const [form, setForm] = useState({ name: "", location: "header", isActive: true, itemsRaw: "[]" });

  const { data: menus = [], isLoading: loading, error } = useQuery<NavMenu[]>({
    queryKey: ["admin", "navigation"],
    queryFn: async () => {
      const res = await adminApi.getNavigationMenus();
      return (res.menus as NavMenu[]) ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: { name: string; location: string; isActive: boolean; itemsRaw: string }) => {
      const items = JSON.parse(payload.itemsRaw || "[]");
      const body = { name: payload.name, location: payload.location, isActive: payload.isActive, items };
      if (editItem) {
        await adminApi.updateNavigation(editItem.id, body);
      } else {
        await adminApi.createNavigation(body);
      }
    },
    onSuccess: () => {
      toast("Menu saved successfully", "success");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "navigation"] });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to save menu", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteNavigation(id);
    },
    onSuccess: () => {
      toast("Menu deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["admin", "navigation"] });
      queryClient.invalidateQueries({ queryKey: ["navigation"] });
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to delete menu", "error");
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", location: "header", isActive: true, itemsRaw: "[]" });
    setModalOpen(true);
  };

  const openEdit = (menu: NavMenu) => {
    setEditItem(menu);
    setForm({
      name: menu.name, location: menu.location, isActive: menu.isActive,
      itemsRaw: JSON.stringify(menu.items ?? [], null, 2),
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  const handleDelete = (id: string) => {
    const menu = menus.find((m) => m.id === id);
    if (!window.confirm(`Delete "${menu?.name ?? "this menu"}"? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  };

  const itemCount = (items: NavItem[]): number => {
    let count = items.length;
    for (const item of items) {
      if (item.children) count += itemCount(item.children);
    }
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error.message}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Navigation</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage navigation menus</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium">
          <Plus size={16} /> Add Menu
        </button>
      </div>

      {menus.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={MenuIcon} title="No menus yet" description="Create navigation menus for header, footer, etc."
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Add Menu</button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white border border-neutral-200 rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-sm text-neutral-900">{menu.name}</h3>
                  <p className="text-xs text-neutral-500 capitalize">{menu.location} menu · {itemCount(menu.items ?? [])} items</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    menu.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {menu.isActive ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => openEdit(menu)} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(menu.id)} className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {menu.items && menu.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {menu.items.map((item, i) => (
                    <span key={i} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                      {item.label}{item.children?.length ? ` (${item.children.length})` : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Edit Menu" : "New Menu"} size="lg">
        <div className="space-y-4">
          <div className="grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Menu Name *</label>
              <input required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Location</label>
              <select value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none">
                <option value="header">Header Navigation</option>
                <option value="footer">Footer</option>
                <option value="mobile">Mobile Menu</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Menu Items (JSON)</label>
            <textarea rows={10} value={form.itemsRaw}
              onChange={(e) => setForm({ ...form, itemsRaw: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder='[{"label":"Shop","url":"/shop","children":[{"label":"New In","url":"/shop/new-in"}]}]'
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} disabled={saveMutation.isPending} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
              {saveMutation.isPending ? "Saving..." : editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
