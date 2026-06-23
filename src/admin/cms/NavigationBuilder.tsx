import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Edit3, Trash2, Plus, Menu as MenuIcon } from "lucide-react";

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
  const [menus, setMenus] = useState<NavMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<NavMenu | null>(null);
  const [form, setForm] = useState({ name: "", location: "header", isActive: true, itemsRaw: "[]" });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNavigationMenus();
      setMenus((res.menus as NavMenu[]) ?? []);
    } catch (error) {
      // failed to fetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

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

  const handleSave = async () => {
    try {
      const items = JSON.parse(form.itemsRaw || "[]");
      const payload = { ...form, items };
      if (editItem) {
        await adminApi.updateNavigation(editItem.id, payload);
      } else {
        await adminApi.createNavigation(payload);
      }
      setModalOpen(false);
      fetch();
    } catch (error) {
      // failed to save
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteNavigation(id);
      fetch();
    } catch (error) {
      // failed to delete
    }
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
          <div className="grid grid-cols-2 gap-4">
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
            <button onClick={handleSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
              {editItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
