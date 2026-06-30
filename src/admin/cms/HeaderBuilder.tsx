import { useState, useCallback, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { api } from "../../lib/api/client";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { MediaPicker } from "../common/MediaPicker";
import {
  Edit3, Trash2, Plus, Menu, ChevronDown, ChevronRight, GripVertical, Image,
  PlusCircle, X, Settings, Eye, EyeOff, Search, ShoppingBag,
  Heart, User, Bell, Layout as LayoutIcon, ArrowLeft, ArrowLeftRight,
  Smartphone, Globe, Monitor,
} from "lucide-react";
import { Link } from "react-router-dom";
import { type NavigationMenu, type NavigationItem, type MegaMenuColumn, type PromotionalMenuContent } from "../../cms/core/cms-types";
import { useToast } from "../../components/ui/Toast";

interface HeaderConfig {
  style: "standard" | "mega" | "minimal" | "centered";
  sticky: boolean;
  transparent: boolean;
  announcementBar: boolean;
  searchBar: boolean;
  cartIcon: boolean;
  wishlistIcon: boolean;
  accountIcon: boolean;
  menuLocation: "left" | "center" | "right";
  menuStyle: "standard" | "mega" | "dropdown" | "accordion";
  maxNavItems: number;
}

const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  style: "standard",
  sticky: true,
  transparent: false,
  announcementBar: true,
  searchBar: true,
  cartIcon: true,
  wishlistIcon: true,
  accountIcon: true,
  menuLocation: "left",
  menuStyle: "standard",
  maxNavItems: 6,
};

export default function HeaderBuilder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editMenu, setEditMenu] = useState<NavigationMenu | null>(null);
  const [form, setForm] = useState({
    name: "", location: "header" as NavigationMenu["location"], isActive: true,
    items: [] as NavigationItem[],
  });
  const [locationFilter, setLocationFilter] = useState<string | "header" | "footer" | "mobile" | "sidebar">("all");
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [configOpen, setConfigOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: menus = [], isLoading: loading, error: queryError } = useQuery<NavigationMenu[]>({
    queryKey: ["admin", "navigation"],
    queryFn: async () => {
      const res = await adminApi.getNavigationMenus();
      return (res.menus as NavigationMenu[]) ?? [];
    },
  });

  const { data: settingsData } = useQuery<{ settings: Record<string, unknown> | null }>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await api.get<{ settings: Record<string, unknown> | null }>("/api/admin/settings");
      return res;
    },
  });

  useEffect(() => {
    const prefs = settingsData?.settings?.preferences as Record<string, unknown> | undefined;
    const savedConfig = prefs?.headerConfig as HeaderConfig | undefined;
    if (savedConfig) {
      setHeaderConfig((prev) => ({ ...prev, ...savedConfig }));
    }
  }, [settingsData]);

  const saveConfigMutation = useMutation({
    mutationFn: async (config: HeaderConfig) => {
      const prefs = (settingsData?.settings?.preferences as Record<string, unknown>) ?? {};
      await api.put("/api/admin/settings", {
        preferences: { ...prefs, headerConfig: config },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings", "public"] });
      window.dispatchEvent(new Event("settings:updated"));
      toast("Header layout settings saved", "success");
      setConfigOpen(false);
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to save layout settings", "error");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name: form.name, location: form.location, isActive: form.isActive, items: form.items };
      if (editMenu) {
        await adminApi.updateNavigation(editMenu.id, payload);
      } else {
        await adminApi.createNavigation(payload);
      }
    },
    onSuccess: () => {
      const wasEditing = !!editMenu;
      queryClient.invalidateQueries({ queryKey: ["admin", "navigation"] });
      queryClient.invalidateQueries({ queryKey: ["cms", "navigation"] });
      setModalOpen(false);
      toast(wasEditing ? "Menu updated" : "Menu created", "success");
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to save menu", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteNavigation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "navigation"] });
      queryClient.invalidateQueries({ queryKey: ["cms", "navigation"] });
      toast("Menu deleted", "success");
    },
    onError: (err: Error) => {
      toast(err.message || "Failed to delete menu", "error");
    },
  });

  const openCreate = () => {
    setEditMenu(null);
    setForm({ name: "", location: "header", isActive: true, items: [] });
    setExpandedItems(new Set());
    setModalOpen(true);
  };

  const openEdit = (menu: NavigationMenu) => {
    setEditMenu(menu);
    setForm({ name: menu.name, location: menu.location, isActive: menu.isActive, items: menu.items ?? [] });
    setExpandedItems(new Set());
    setModalOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this menu? This cannot be undone.")) return;
    deleteMutation.mutate(id);
  };

  const addItem = (type: NavigationItem["type"] = "link") => {
    const id = crypto.randomUUID();
    const newItem: NavigationItem = {
      id, type, label: "", url: "/", link: "/", target: "_self",
      children: type === "dropdown" || type === "mega_menu" ? [] : undefined,
      megaMenuColumns: type === "mega_menu" ? [{ id: crypto.randomUUID(), title: "", items: [] }] : undefined,
      promotionalContent: type === "promotional" ? { title: "", description: "", image: "", linkUrl: "", linkText: "" } : undefined,
      isVisible: true, isHighlighted: false,
    };
    setForm((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setExpandedItems((prev) => new Set(prev).add(id));
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

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const addChildItem = (parentIdx: number) => {
    const child: NavigationItem = {
      id: crypto.randomUUID(),
      type: "link", label: "", url: "/", link: "/", target: "_self",
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
    const col: MegaMenuColumn = { id: crypto.randomUUID(), title: "", items: [] };
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
      case "mega_menu": return <LayoutIcon size={14} />;
      case "promotional": return <Image size={14} />;
      case "divider": return <ArrowLeftRight size={14} />;
      default: return <Menu size={14} />;
    }
  };

  const countItems = useCallback((items: NavigationItem[]): number => {
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
  }, []);

  const filteredMenus = locationFilter === "all"
    ? menus
    : menus.filter((m) => m.location === locationFilter);

  const locations = [...new Set(menus.map((m) => m.location))];

  const toggleConfigIcon = (key: keyof HeaderConfig) => {
    if (typeof headerConfig[key] === "boolean") {
      setHeaderConfig((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="premium-card rounded-2xl px-8 py-6 flex items-center gap-4 shadow-subtle">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-neutral-200 rounded animate-pulse" />
            <div className="h-2 w-24 bg-neutral-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {queryError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {queryError instanceof Error ? queryError.message : "Failed to load navigation menus"}
        </div>
      )}

      {/* Header section */}
      <Link to="/admin/cms" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to CMS
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-neutral-900 tracking-tight">Header Builder</h1>
          <p className="text-sm text-neutral-500 mt-1.5">Manage navigation menus, mega menus, promotional content, and header layout settings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setConfigOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-subtle">
            <Settings size={15} />
            Layout Settings
          </button>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-all duration-200 shadow-subtle">
            <Plus size={16} />
            Add Menu
          </button>
        </div>
      </div>

      {/* Location filter tabs */}
      {locations.length > 1 && (
        <div className="flex items-center gap-1 mb-6 p-1 bg-neutral-100 rounded-xl w-fit">
          <button onClick={() => setLocationFilter("all")}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              locationFilter === "all" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}>
            All
          </button>
          {(locations as Array<"header" | "footer" | "mobile" | "sidebar">).map((loc) => (
            <button key={loc} onClick={() => setLocationFilter(loc)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  locationFilter === loc ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}>
                {loc.replace("_", " ")}
              </button>
          ))}
        </div>
      )}

      {/* Menu cards */}
      {filteredMenus.length === 0 ? (
        <EmptyState
          icon={Menu}
          title={locationFilter === "all" ? "No menus yet" : `No ${locationFilter} menus`}
          description={locationFilter === "all" ? "Create navigation menus for header, mega menu, etc." : `Create a ${locationFilter} menu to get started`}
          action={<button onClick={openCreate} className="btn-primary">Add Menu</button>}
        />
      ) : (
        <div className="space-y-3">
          {filteredMenus.map((menu) => (
            <div key={menu.id} className="group premium-card rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${menu.isActive ? "bg-green-500" : "bg-red-400"}`} />
                  <div>
                    <h3 className="font-medium text-sm text-neutral-900">{menu.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-neutral-400 capitalize">{menu.location.replace("_", " ")}</span>
                      <span className="text-[11px] text-neutral-300">·</span>
                      <span className="text-[11px] text-neutral-400">{countItems(menu.items ?? [])} items</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${
                    menu.isActive
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>{menu.isActive ? "Active" : "Inactive"}</span>
                  <button onClick={() => openEdit(menu)}
                    className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-600 transition-all opacity-0 group-hover:opacity-100">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(menu.id)} disabled={deleteMutation.isPending}
                    className="p-2 hover:bg-red-50 rounded-xl text-neutral-400 hover:text-red-500 transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100">
                    {deleteMutation.isPending ? <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
              {menu.items.length > 0 && (
                <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                  {menu.items.slice(0, 6).map((item, i) => {
                    const childCount = (item.children?.length ?? 0) + (item.megaMenuColumns?.flatMap((c) => c.items).length ?? 0);
                    return (
                      <span key={i}
                        className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                          item.isHighlighted
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-neutral-50 text-neutral-600 border-neutral-100"
                        }`}>
                        {typeIcon(item.type)}
                        {item.label || "Untitled"}
                        {item.badge && <span className="text-[9px] bg-brand-500 text-white px-1 rounded">{item.badge}</span>}
                        {childCount > 0 && <span className="text-neutral-400">({childCount})</span>}
                      </span>
                    );
                  })}
                  {menu.items.length > 6 && (
                    <span className="text-[11px] text-neutral-400 px-2 py-1">+{menu.items.length - 6} more</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMenu ? "Edit Menu" : "New Menu"} size="xl">
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Menu Name *</label>
              <input required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                placeholder="e.g. Main Menu" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Location</label>
              <select value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value as NavigationMenu["location"] })}
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none bg-white">
                <option value="header">Header Main Navigation</option>
                <option value="footer">Footer Menu</option>
                <option value="mobile">Mobile Menu</option>
                <option value="sidebar">Sidebar</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="sr-only peer" />
              <div className="w-9 h-5 bg-neutral-300 rounded-full peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
            <span className="text-sm text-neutral-600">
              {form.isActive ? "Active — visible on storefront" : "Inactive — hidden from storefront"}
            </span>
          </div>

          {/* Menu Items Editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Menu Items</span>
              <div className="flex gap-1.5">
                <button onClick={() => addItem("link")}
                  className="text-[11px] px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 hover:text-neutral-800 font-medium transition-all">+ Link</button>
                <button onClick={() => addItem("dropdown")}
                  className="text-[11px] px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 hover:text-neutral-800 font-medium transition-all">+ Dropdown</button>
                <button onClick={() => addItem("mega_menu")}
                  className="text-[11px] px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 hover:text-neutral-800 font-medium transition-all">+ Mega Menu</button>
                <button onClick={() => addItem("promotional")}
                  className="text-[11px] px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 hover:text-neutral-800 font-medium transition-all">+ Promo</button>
              </div>
            </div>

            <div className="space-y-2">
              {form.items.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                  <Menu size={24} className="mx-auto text-neutral-300 mb-2" />
                  <p className="text-xs text-neutral-400">No menu items yet. Click the buttons above to add links, dropdowns, or mega menus.</p>
                </div>
              ) : (
                form.items.map((item, idx) => {
                  const isExpanded = expandedItems.has(item.id);
                  const childCount = (item.children?.length ?? 0) + (item.megaMenuColumns?.flatMap((c) => c.items).length ?? 0);

                  return (
                    <div key={item.id} className={`bg-white rounded-xl border transition-all shadow-subtle ${isExpanded ? "border-neutral-300" : "border-neutral-200 hover:border-neutral-300"}`}>
                      {/* Accordion Header — always visible */}
                      <div
                        className="flex items-center gap-2.5 px-4 py-3 cursor-pointer select-none"
                        onClick={() => toggleItemExpanded(item.id)}
                      >
                        <GripVertical size={15} className="text-neutral-300 shrink-0 cursor-grab" onClick={(e) => e.stopPropagation()} />
                        {isExpanded ? <ChevronDown size={14} className="text-neutral-400 shrink-0" /> : <ChevronRight size={14} className="text-neutral-400 shrink-0" />}
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium capitalize ${
                          item.type === "mega_menu" ? "bg-purple-50 text-purple-700" :
                          item.type === "dropdown" ? "bg-blue-50 text-blue-700" :
                          item.type === "promotional" ? "bg-amber-50 text-amber-700" :
                          item.type === "divider" ? "bg-neutral-100 text-neutral-500" :
                          "bg-neutral-50 text-neutral-600"
                        }`}>
                          {typeIcon(item.type)} {item.type.replace("_", " ")}
                        </span>
                        <span className="text-sm text-neutral-900 font-medium truncate flex-1">
                          {item.label || <span className="text-neutral-400 italic">Untitled</span>}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] bg-brand-500 text-white px-1.5 py-0.5 rounded">{item.badge}</span>
                        )}
                        {item.isHighlighted && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Hot</span>
                        )}
                        {childCount > 0 && (
                          <span className="text-[10px] text-neutral-400">{childCount} child{childCount !== 1 ? "ren" : ""}</span>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-all shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Accordion Body — expanded editing form */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-neutral-100 space-y-3">
                          {/* Row 1: Type + Label + URL */}
                          <div className="flex items-center gap-2.5">
                            <select value={item.type}
                              onChange={(e) => updateItem(idx, "type", e.target.value as NavigationItem["type"])}
                              className="text-xs px-2 py-1.5 border border-neutral-200 rounded-lg bg-white font-medium">
                              <option value="link">Link</option>
                              <option value="dropdown">Dropdown</option>
                              <option value="mega_menu">Mega Menu</option>
                              <option value="promotional">Promotional</option>
                              <option value="divider">Divider</option>
                            </select>
                            <input placeholder="Label" value={item.label}
                              onChange={(e) => updateItem(idx, "label", e.target.value)}
                              className="flex-1 px-2.5 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                            {item.type !== "divider" && (
                              <input placeholder="URL" value={item.url}
                                onChange={(e) => updateItem(idx, "url", e.target.value)}
                                className="w-32 px-2.5 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                            )}
                          </div>

                          {/* Row 2: Image + Badge + Hot */}
                          {item.type !== "divider" && (
                            <div className="flex items-center gap-2.5">
                              <MediaPicker value={item.image ?? ""}
                                onChange={(url: string) => updateItem(idx, "image", url)}
                                folder="navigation" placeholder="Banner" />
                              <input type="text" placeholder="Badge" value={item.badge ?? ""}
                                onChange={(e) => updateItem(idx, "badge", e.target.value)}
                                className="w-20 px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg" title="Badge text (e.g. NEW)" />
                              <label className="flex items-center gap-1.5 text-[11px] text-neutral-500 cursor-pointer px-2 py-1 rounded-lg hover:bg-amber-50">
                                <input type="checkbox" checked={item.isHighlighted}
                                  onChange={(e) => updateItem(idx, "isHighlighted", e.target.checked)}
                                  className="accent-brand-500" />
                                <span className={item.isHighlighted ? "text-amber-600 font-medium" : ""}>Hot</span>
                              </label>
                            </div>
                          )}

                          {/* Link description */}
                          {item.type === "link" && (
                            <input placeholder="Description (shown below link in dropdowns)" value={item.description ?? ""}
                              onChange={(e) => updateItem(idx, "description", e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                          )}

                          {/* Mega Menu banner + columns */}
                          {item.type === "mega_menu" && (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[10px] text-neutral-400 mb-1 block">Banner Image</label>
                                  <MediaPicker value={item.image ?? ""}
                                    onChange={(url: string) => updateItem(idx, "image", url)}
                                    folder="navigation-mega" placeholder="Banner image URL" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-neutral-400 mb-1 block">Banner Description</label>
                                  <input placeholder="Featured collection description" value={item.description ?? ""}
                                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Columns</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                  {item.megaMenuColumns?.map((col, ci) => (
                                    <div key={col.id} className="bg-neutral-50 rounded-xl border border-neutral-100 p-3 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <input placeholder="Column title" value={col.title}
                                          onChange={(e) => {
                                            const newCols = [...(item.megaMenuColumns ?? [])];
                                            newCols[ci] = { ...newCols[ci], title: e.target.value };
                                            updateItem(idx, "megaMenuColumns", newCols);
                                          }}
                                          className="flex-1 px-2 py-1.5 text-xs font-medium border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                                      </div>
                                      {col.items.map((colItem, ii) => (
                                        <div key={ii} className="flex items-center gap-1">
                                          <input placeholder="Link" value={colItem.label}
                                            onChange={(e) => {
                                              const newCols = [...(item.megaMenuColumns ?? [])];
                                              newCols[ci] = { ...newCols[ci], items: newCols[ci].items.map((it, i) => i === ii ? { ...it, label: e.target.value } : it) };
                                              updateItem(idx, "megaMenuColumns", newCols);
                                            }}
                                            className="flex-1 px-1.5 py-1 text-[10px] border border-neutral-200 rounded-lg" />
                                          <input placeholder="/url" value={colItem.url}
                                            onChange={(e) => {
                                              const newCols = [...(item.megaMenuColumns ?? [])];
                                              newCols[ci] = { ...newCols[ci], items: newCols[ci].items.map((it, i) => i === ii ? { ...it, url: e.target.value } : it) };
                                              updateItem(idx, "megaMenuColumns", newCols);
                                            }}
                                            className="w-14 px-1.5 py-1 text-[10px] border border-neutral-200 rounded-lg" />
                                        </div>
                                      ))}
                                      <button onClick={() => addMegaColumnItem(idx, ci)}
                                        className="text-[10px] text-brand-600 hover:text-brand-700 font-medium">+ Add link</button>
                                    </div>
                                  ))}
                                </div>
                                <button onClick={() => addMegaColumn(idx)}
                                  className="text-[11px] text-brand-600 hover:text-brand-700 font-medium">+ Add column</button>
                              </div>
                            </>
                          )}

                          {/* Dropdown Children */}
                          {item.type === "dropdown" && (
                            <div className="space-y-2">
                              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Child Items</label>
                              {item.children?.map((child, ci) => (
                                <div key={child.id} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                                  <span className="text-neutral-300 text-xs">↳</span>
                                  <input placeholder="Label" value={child.label}
                                    onChange={(e) => updateChildItem(idx, ci, "label", e.target.value)}
                                    className="flex-1 px-2 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                                  <input placeholder="URL" value={child.url}
                                    onChange={(e) => updateChildItem(idx, ci, "url", e.target.value)}
                                    className="w-24 px-2 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                                  <input placeholder="Description" value={child.description ?? ""}
                                    onChange={(e) => updateChildItem(idx, ci, "description", e.target.value)}
                                    className="w-24 px-2 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                                  <button onClick={() => removeChildItem(idx, ci)}
                                    className="text-red-400 hover:text-red-600 p-1 rounded">
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}
                              <button onClick={() => addChildItem(idx)}
                                className="text-[11px] text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                                <PlusCircle size={11} /> Add child item
                              </button>
                            </div>
                          )}

                          {/* Promotional Content */}
                          {item.type === "promotional" && item.promotionalContent && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gradient-to-br from-neutral-50 to-white rounded-xl border border-neutral-100">
                              <div>
                                <label className="text-[10px] text-neutral-400 mb-1 block">Title</label>
                                <input placeholder="Campaign title" value={item.promotionalContent.title}
                                  onChange={(e) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, title: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-400 mb-1 block">Description</label>
                                <input placeholder="Campaign description" value={item.promotionalContent.description}
                                  onChange={(e) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, description: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-400 mb-1 block">Image</label>
                                <MediaPicker value={item.promotionalContent?.image ?? ""}
                                  onChange={(url: string, publicId?: string) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, image: url, imagePublicId: publicId })}
                                  folder="promotions" placeholder="Image URL" />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-400 mb-1 block">Link URL</label>
                                <input placeholder="Campaign link" value={item.promotionalContent.linkUrl}
                                  onChange={(e) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, linkUrl: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                              </div>
                              <div>
                                <label className="text-[10px] text-neutral-400 mb-1 block">Link Text</label>
                                <input placeholder="Button text" value={item.promotionalContent.linkText}
                                  onChange={(e) => updateItem(idx, "promotionalContent", { ...item.promotionalContent!, linkText: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saveMutation.isPending || !form.name}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-subtle">
              {saveMutation.isPending && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editMenu ? "Update Menu" : "Create Menu"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Header Layout Settings Modal */}
      <Modal open={configOpen} onClose={() => setConfigOpen(false)} title="Header Layout Settings" size="lg">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Header Style</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["standard", "mega", "minimal", "centered"] as const).map((style) => (
                <button key={style}
                  onClick={() => setHeaderConfig((prev) => ({ ...prev, style }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    headerConfig.style === style
                      ? "border-brand-500 bg-brand-50 shadow-sm"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}>
                  <LayoutIcon size={18} className={`mx-auto mb-1.5 ${headerConfig.style === style ? "text-brand-500" : "text-neutral-400"}`} />
                  <span className={`text-xs font-medium capitalize ${headerConfig.style === style ? "text-brand-600" : "text-neutral-600"}`}>{style}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Menu Position & Style</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500 mb-1.5 block">Menu Alignment</label>
                <select value={headerConfig.menuLocation}
                  onChange={(e) => setHeaderConfig((prev) => ({ ...prev, menuLocation: e.target.value as HeaderConfig["menuLocation"] }))}
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1.5 block">Menu Style</label>
                <select value={headerConfig.menuStyle}
                  onChange={(e) => setHeaderConfig((prev) => ({ ...prev, menuStyle: e.target.value as HeaderConfig["menuStyle"] }))}
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl">
                  <option value="standard">Standard</option>
                  <option value="mega">Mega Menu</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="accordion">Accordion</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Visibility & Behavior</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "sticky" as keyof HeaderConfig, label: "Sticky Header", icon: Monitor, desc: "Header stays fixed on scroll" },
                { key: "transparent" as keyof HeaderConfig, label: "Transparent", icon: Eye, desc: "Transparent background on top" },
                { key: "announcementBar" as keyof HeaderConfig, label: "Announcement Bar", icon: Bell, desc: "Show announcement banner" },
              ].map(({ key, label, icon: Icon, desc }) => (
                <label key={key}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    headerConfig[key]
                      ? "border-brand-500 bg-brand-50"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}>
                  <input type="checkbox" checked={headerConfig[key] as boolean}
                    onChange={() => toggleConfigIcon(key)}
                    className="sr-only" />
                  <Icon size={18} className={`mt-0.5 shrink-0 ${headerConfig[key] ? "text-brand-500" : "text-neutral-400"}`} />
                  <div>
                    <p className={`text-sm font-medium ${headerConfig[key] ? "text-brand-700" : "text-neutral-700"}`}>{label}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Icon Visibility</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "searchBar" as keyof HeaderConfig, icon: Search, label: "Search" },
                { key: "cartIcon" as keyof HeaderConfig, icon: ShoppingBag, label: "Cart" },
                { key: "wishlistIcon" as keyof HeaderConfig, icon: Heart, label: "Wishlist" },
                { key: "accountIcon" as keyof HeaderConfig, icon: User, label: "Account" },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key}
                  onClick={() => toggleConfigIcon(key)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    headerConfig[key]
                      ? "border-brand-500 bg-brand-50"
                      : "border-neutral-200 hover:border-neutral-300 bg-white opacity-60 hover:opacity-100"
                  }`}>
                  <Icon size={18} className={`mx-auto mb-1.5 ${headerConfig[key] ? "text-brand-500" : "text-neutral-400"}`} />
                  <span className={`text-xs font-medium ${headerConfig[key] ? "text-brand-600" : "text-neutral-500"}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Max Navigation Items</h3>
            <div className="flex items-center gap-3">
              <input type="range" min={3} max={10} value={headerConfig.maxNavItems}
                onChange={(e) => setHeaderConfig((prev) => ({ ...prev, maxNavItems: parseInt(e.target.value) }))}
                className="flex-1 accent-brand-500" />
              <span className="text-sm font-medium text-neutral-700 w-8 text-center">{headerConfig.maxNavItems}</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Number of top-level navigation items shown in the header</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button onClick={() => {
              setHeaderConfig(DEFAULT_HEADER_CONFIG);
              saveConfigMutation.mutate(DEFAULT_HEADER_CONFIG);
            }}
              disabled={saveConfigMutation.isPending}
              className="px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-700 font-medium transition-colors disabled:opacity-50">
              Reset to Defaults
            </button>
            <button onClick={() => saveConfigMutation.mutate(headerConfig)}
              disabled={saveConfigMutation.isPending}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-all shadow-subtle disabled:opacity-50 flex items-center gap-2">
              {saveConfigMutation.isPending && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Settings
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
