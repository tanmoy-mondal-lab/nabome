import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Plus, Edit3, Trash2, Tag } from "lucide-react";

export default function LabelsPage() {
  const [labels, setLabels] = useState<unknown[]>([]);
  const [tags, setTags] = useState<unknown[]>([]);
  const [activeTab, setActiveTab] = useState<"labels" | "tags">("labels");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: "", color: "#c9a84c" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [l, t] = await Promise.all([adminApi.getLabels(), adminApi.getTags()]);
      setLabels(l.labels ?? []); setTags(t.tags ?? []);
    } catch {}
    setLoading(false);
  }

  function openCreate() { setEdit(null); setForm({ name: "", color: "#c9a84c" }); setShowModal(true); }

  function openEdit(item: Record<string, unknown>) { setEdit(item); setForm({ name: item.name as string ?? "", color: (item.color as string) ?? "#c9a84c" }); setShowModal(true); }

  async function handleSave() {
    if (activeTab === "labels") {
      if (edit) await adminApi.updateLabel(edit.id as string, form);
      else await adminApi.createLabel(form);
    } else {
      if (!edit) await adminApi.createTag(form);
    }
    setShowModal(false); load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`Delete this ${activeTab === "labels" ? "label" : "tag"}?`)) return;
    if (activeTab === "labels") await adminApi.deleteLabel(id);
    else await adminApi.deleteTag(id);
    load();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-neutral-900">Product Labels & Tags</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage labels (badges) and search tags</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm font-medium rounded hover:bg-neutral-800">
          <Plus className="w-4 h-4" /> Add {activeTab === "labels" ? "Label" : "Tag"}
        </button>
      </div>

      <div className="flex gap-1 border-b">
        <button onClick={() => setActiveTab("labels")} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "labels" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>Labels</button>
        <button onClick={() => setActiveTab("tags")} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "tags" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>Tags</button>
      </div>

      {activeTab === "labels" && (labels.length === 0 && !loading ? <EmptyState title="No labels" description="Create product labels like 'New', 'Sale', 'Best Seller'." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded">Add Label</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "color", label: "Color", render: (item) => { const v = (item as Record<string, unknown>).color as string; return <span className="inline-block w-6 h-6 rounded border" style={{ backgroundColor: v }} />; } },
          { key: "slug", label: "Slug" },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{(((item as Record<string, unknown>)._count as Record<string, number>)?.products ?? 0)}</span> },
        ]} data={labels} isLoading={loading} actions={(row) => <><button onClick={() => openEdit(row as Record<string, unknown>)} className="p-1.5 text-neutral-400 hover:text-neutral-600"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete((row as Record<string, unknown>).id as string)} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />)}

      {activeTab === "tags" && (tags.length === 0 && !loading ? <EmptyState title="No tags" description="Create search tags for products." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded">Add Tag</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "slug", label: "Slug" },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{(((item as Record<string, unknown>)._count as Record<string, number>)?.products ?? 0)}</span> },
        ]} data={tags} isLoading={loading} actions={(row) => <>
          <button onClick={() => handleDelete((row as Record<string, unknown>).id as string)} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />)}

      <Modal open={showModal} title={edit ? `Edit ${activeTab === "labels" ? "Label" : "Tag"}` : `Create ${activeTab === "labels" ? "Label" : "Tag"}`} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-xs text-neutral-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border rounded" /></div>
          {activeTab === "labels" && <div><label className="block text-xs text-neutral-500 mb-1">Color</label><div className="flex gap-2 items-center"><input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" /><span className="text-xs text-neutral-400">{form.color}</span></div></div>}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button onClick={() => setShowModal(false)} type="button" className="px-4 py-2 text-sm border border-neutral-200 rounded text-neutral-600 hover:bg-neutral-50">Cancel</button>
          <button onClick={handleSave} type="button" className="px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">Save</button>
        </div>
      </Modal>
    </div>
  );
}
