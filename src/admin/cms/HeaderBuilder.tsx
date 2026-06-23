import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { MediaPicker } from "../common/MediaPicker";
import { Edit3, Trash2, Plus, Menu, ChevronDown, GripVertical, Image, PlusCircle, X } from "lucide-react";
import { type NavigationMenu, type NavigationItem, type MegaMenuColumn, type PromotionalMenuContent } from "../../cms/core/cms-types";

export default function HeaderBuilder() {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMenu, setEditMenu] = useState<NavigationMenu | null>(null);
  const [form, setForm] = useState({
    name: "", location: "header" as NavigationMenu["location"], isActive: true,
    items: [] as NavigationItem[],
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNavigationMenus();
      setMenus((res.menus as NavigationMenu[]) ?? []);
    } catch (error) {
      // failed to fetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditMenu(null);
    setForm({ name: "", location: "header", isActive: true, items: [] });
    setModalOpen(true);
  };

  const openEdit = (menu: NavigationMenu) => {
    setEditMenu(menu);
    setForm({ name: menu.name, location: menu.location, isActive: menu.isActive, items: menu.items ?? [] });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { name: form.name, location: form.location, isActive: form.isActive, items: form.items };
      if (editMenu) {
        await adminApi.updateNavigation(editMenu.id, payload);
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

  // Menu item editing helpers
  const addItem = (type: NavigationItem["type"] = "link") => {
    const newItem: NavigationItem = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      type, label: "", url: "/", target: "_self",
      children: type === "dropdown" || type === "mega_menu" ? [] : undefined,
      megaMenuColumns: type === "mega_menu" ? [{ id: crypto.randomUUID?.() ?? "1", title: "", items: [] }] : undefined,
      promotionalContent: type === "promotional" ? { title: "", description: "", image: "", linkUrl: "", linkText: "" } : undefined,
      isVisible: true, isHighlighted: false,
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (idx: number, field: keyof NavigationItem, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const removeItem = (idx: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const addChildItem = (parentIdx: number) => {
    const child: NavigationItem = {
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      type: "link", label: "", url: "/", target: "_self",
      isVisible: true, isHighlighted: false,
    };
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === parentIdx ? { ...item, children: [...(item.children ?? []), child] } : item
      ),
    }));
  };

  const updateChildItem = (parentIdx: number, childIdx: number, field: keyof NavigationItem, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === parentIdx
          ? { ...item, children: item.children?.map((c, ci) => (ci === childIdx ? { ...c, [field]: value } : c)) }
          : item
      ),
    }));
  };

  const removeChildItem = (parentIdx: number, childIdx: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === parentIdx
          ? { ...item, children: item.children?.filter((_, ci) => ci !== childIdx) }
          : item
      ),
    }));
  };

  const addMegaColumn = (parentIdx: number) => {
    const col: MegaMenuColumn = { id: crypto.randomUUID?.() ?? `${Date.now()}`, title: "", items: [] };
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === parentIdx
          ? { ...item, megaMenuColumns: [...(item.megaMenuColumns ?? []), col] }
          : item
      ),
    }));
  };

  const addMegaColumnItem = (parentIdx: number, colIdx: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === parentIdx
          ? {
              ...item,
              megaMenuColumns: item.megaMenuColumns?.map((col, ci) =>
                ci === colIdx
                  ? { ...col, items: [...col.items, { label: "", url: "/", description: "", image: "" }] }
                  : col
              ),
            }
          : item
      ),
    }));
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "dropdown": return <ChevronDown size={14} />;
      case "mega_menu": return <Image size={14} />;
      case "promotional": return <Image size={14} />;
      default: return <Menu size={14} />;
    }
  };

  const countItems = (items: NavigationItem[]): number => {
    let count = 0;
    for (const item of items) {
      count++;
      if (item.children) count += countItems(item.children);
      if (item.megaMenuColumns) {
        for (const col of item.megaMenuColumns) {
          count += col.items.length;
        }
      }
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
          <h1 className="font-display text-2xl text-neutral-900">Header Builder</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage navigation menus, mega menus, and header layout</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium">
          <Plus size={16} /> Add Menu
        </button>
      </div>

      {menus.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Menu} title="No menus yet" description="Create navigation menus for header, mega menu, etc."
            action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Add Menu</button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white border border-neutral-200 rounded overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-medium text-sm text-neutral-900">{menu.name}</h3>
                  <p className="text-xs text-neutral-500 capitalize">{menu.location.replace("_", " ")} · {countItems(menu.items ?? [])} items</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                    menu.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                  }`}>{menu.isActive ? "Active" : "Inactive"}</span>
                  <button onClick={() => openEdit(menu)} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(menu.id)} className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {menu.items.length > 0 && (
                <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                  {menu.items.map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
                      {typeIcon(item.type)}
                      {item.label || "Untitled"}
                      {item.children?.length ? ` (${item.children.length})` : ""}
                      {item.megaMenuColumns?.length ? ` [${item.megaMenuColumns.flatMap(c => c.items).length} cols]` : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMenu ? "Edit Menu" : "New Menu"} size="xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
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
                onChange={(e) => setForm({ ...form, location: e.target.value as NavigationMenu["location"] })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                <option value="header">Header Main Navigation</option>
                <option value="footer">Footer Menu</option>
                <option value="mobile">Mobile Menu</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-brand-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </label>

          {/* Menu Items Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-500">Menu Items</span>
              <div className="flex gap-1">
                <button onClick={() => addItem("link")} className="text-[10px] px-2 py-1 bg-neutral-100 rounded hover:bg-neutral-200">+ Link</button>
                <button onClick={() => addItem("dropdown")} className="text-[10px] px-2 py-1 bg-neutral-100 rounded hover:bg-neutral-200">+ Dropdown</button>
                <button onClick={() => addItem("mega_menu")} className="text-[10px] px-2 py-1 bg-neutral-100 rounded hover:bg-neutral-200">+ Mega Menu</button>
                <button onClick={() => addItem("promotional")} className="text-[10px] px-2 py-1 bg-neutral-100 rounded hover:bg-neutral-200">+ Promo</button>
              </div>
            </div>
            <div className="space-y-2">
              {form.items.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No menu items. Add links, dropdowns, or mega menus.</p>
              ) : (
                form.items.map((item, idx) => (
                  <div key={item.id} className="bg-neutral-50 rounded border border-neutral-100 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-neutral-300 shrink-0" />
                      <select value={item.type}
                        onChange={(e) => updateItem(idx, "type", e.target.value as NavigationItem["type"])}
                        className="text-xs px-1.5 py-1 border border-neutral-200 rounded bg-white">
                        <option value="link">Link</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="mega_menu">Mega Menu</option>
                        <option value="promotional">Promotional</option>
                        <option value="divider">Divider</option>
                      </select>
                      <input placeholder="Label" value={item.label}
                        onChange={(e) => updateItem(idx, "label", e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded" />
                      {item.type !== "divider" && (
                        <input placeholder="URL" value={item.url}
                          onChange={(e) => updateItem(idx, "url", e.target.value)}
                          className="w-32 px-2 py-1 text-xs border border-neutral-200 rounded" />
                      )}
                      <input type="text" placeholder="Badge" value={item.badge ?? ""}
                        onChange={(e) => updateItem(idx, "badge", e.target.value)}
                        className="w-16 px-2 py-1 text-xs border border-neutral-200 rounded" title="Badge text (e.g. NEW)" />
                      <label className="flex items-center gap-1 text-[10px] text-neutral-400">
                        <input type="checkbox" checked={item.isHighlighted}
                          onChange={(e) => updateItem(idx, "isHighlighted", e.target.checked)}
                          className="accent-brand-500" />
                        Highlight
                      </label>
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {/* Dropdown Children */}
                    {item.type === "dropdown" && (
                      <div className="ml-6 space-y-1.5">
                        {item.children?.map((child, ci) => (
                          <div key={child.id} className="flex items-center gap-1.5">
                            <span className="text-neutral-300">↳</span>
                            <input placeholder="Label" value={child.label}
                              onChange={(e) => updateChildItem(idx, ci, "label", e.target.value)}
                              className="flex-1 px-2 py-1 text-[11px] border border-neutral-200 rounded" />
                            <input placeholder="URL" value={child.url}
                              onChange={(e) => updateChildItem(idx, ci, "url", e.target.value)}
                              className="w-28 px-2 py-1 text-[11px] border border-neutral-200 rounded" />
                            <button onClick={() => removeChildItem(idx, ci)} className="text-red-400 p-0.5">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => addChildItem(idx)}
                          className="text-[10px] text-brand-600 hover:text-brand-700 flex items-center gap-0.5">
                          <PlusCircle size={10} /> Add item
                        </button>
                      </div>
                    )}

                    {/* Mega Menu Columns */}
                    {item.type === "mega_menu" && (
                      <div className="ml-6 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          {item.megaMenuColumns?.map((col, ci) => (
                            <div key={col.id} className="bg-white rounded border border-neutral-100 p-2">
                              <input placeholder="Column title" value={col.title}
                                onChange={(e) => {
                                  const newCols = [...(item.megaMenuColumns ?? [])];
                                  newCols[ci] = { ...newCols[ci], title: e.target.value };
                                  updateItem(idx, "megaMenuColumns", newCols);
                                }}
                                className="w-full px-1.5 py-1 text-[11px] font-medium border border-neutral-200 rounded mb-1" />
                              {col.items.map((colItem, ii) => (
                                <div key={ii} className="flex items-center gap-1 mb-0.5">
                                  <input placeholder="Link label" value={colItem.label}
                                    onChange={(e) => {
                                      const newCols = [...(item.megaMenuColumns ?? [])];
                                      newCols[ci].items[ii] = { ...newCols[ci].items[ii], label: e.target.value };
                                      updateItem(idx, "megaMenuColumns", newCols);
                                    }}
                                    className="flex-1 px-1.5 py-0.5 text-[10px] border border-neutral-200 rounded" />
                                  <input placeholder="/url" value={colItem.url}
                                    onChange={(e) => {
                                      const newCols = [...(item.megaMenuColumns ?? [])];
                                      newCols[ci].items[ii] = { ...newCols[ci].items[ii], url: e.target.value };
                                      updateItem(idx, "megaMenuColumns", newCols);
                                    }}
                                    className="w-16 px-1.5 py-0.5 text-[10px] border border-neutral-200 rounded" />
                                </div>
                              ))}
                              <button onClick={() => addMegaColumnItem(idx, ci)}
                                className="text-[10px] text-brand-600 mt-1">+ Add link</button>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => addMegaColumn(idx)}
                          className="text-[10px] text-brand-600">+ Add column</button>
                      </div>
                    )}

                    {/* Promotional Content */}
                    {item.type === "promotional" && item.promotionalContent && (
                      <div className="ml-6 grid grid-cols-2 gap-2">
                        <input placeholder="Title" value={item.promotionalContent.title}
                          onChange={(e) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, title: e.target.value })}
                          className="px-2 py-1 text-xs border border-neutral-200 rounded" />
                        <input placeholder="Description" value={item.promotionalContent.description}
                          onChange={(e) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, description: e.target.value })}
                          className="px-2 py-1 text-xs border border-neutral-200 rounded" />
                        <MediaPicker value={item.promotionalContent?.image ?? ""} onChange={(url: string) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, image: url })} folder="promotions" placeholder="Image URL" />
                        <input placeholder="Link URL" value={item.promotionalContent.linkUrl}
                          onChange={(e) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, linkUrl: e.target.value })}
                          className="px-2 py-1 text-xs border border-neutral-200 rounded" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
            <button onClick={handleSave} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
              {editMenu ? "Update Menu" : "Create Menu"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
