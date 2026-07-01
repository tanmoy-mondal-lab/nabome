import { useState } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Plus, Edit3, Trash2, Tag, AlertCircle } from "lucide-react";
import { useToast } from "../../components/ui/Toast";

interface Label {
  id: string;
  name: string;
  slug: string;
  color: string;
  _count?: { products?: number };
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count?: { products?: number };
}

export default function LabelsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"labels" | "tags">("labels");
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<Label | TagItem | null>(null);
  const [form, setForm] = useState({ name: "", color: "#c9a84c" });

  const { data: labelsData, isLoading: loadingLabels, isError: isErrorLabels, refetch: refetchLabels } = useQuery({
    queryKey: ["admin", "labels"],
    queryFn: async () => {
      const res = await adminApi.getLabels();
      return (res.labels ?? []) as Label[];
    },
  });

  const { data: tagsData, isLoading: loadingTags, isError: isErrorTags, refetch: refetchTags } = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: async () => {
      const res = await adminApi.getTags();
      return (res.tags ?? []) as TagItem[];
    },
  });

  const labels = labelsData ?? [];
  const tags = tagsData ?? [];
  const loading = loadingLabels || loadingTags;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (activeTab === "labels") {
        if (edit) await adminApi.updateLabel(edit.id, form);
        else await adminApi.createLabel(form);
      } else {
        if (edit) await adminApi.updateTag(edit.id, form);
        else await adminApi.createTag(form);
      }
    },
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "labels"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      toast(`Successfully saved ${activeTab === "labels" ? "label" : "tag"}`, "success");
    },
    onError: (err: Error) => {
      toast(`Failed to save ${activeTab === "labels" ? "label" : "tag"}: ${err.message ?? "Unknown error"}`, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (activeTab === "labels") await adminApi.deleteLabel(id);
      else await adminApi.deleteTag(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "labels"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      toast(`Successfully deleted ${activeTab === "labels" ? "label" : "tag"}`, "success");
    },
    onError: (err: Error) => {
      toast(`Failed to delete ${activeTab === "labels" ? "label" : "tag"}: ${err.message ?? "Unknown error"}`, "error");
    },
  });

  function openCreate() { setEdit(null); setForm({ name: "", color: "#c9a84c" }); setShowModal(true); }
  function openEdit(item: Label | TagItem) { setEdit(item); setForm({ name: item.name, color: "color" in item ? item.color : "#c9a84c" }); setShowModal(true); }
  function handleSave() { if (!form.name.trim()) return; saveMutation.mutate(); }
  function handleDelete(id: string) { deleteMutation.mutate(id); }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-neutral-900">Product Labels & Tags</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage labels (badges) and search tags</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors">
          <Plus className="w-4 h-4" /> Add {activeTab === "labels" ? "Label" : "Tag"}
        </button>
      </div>

      <div className="flex gap-1 border-b">
        <button onClick={() => setActiveTab("labels")} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "labels" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>Labels</button>
        <button onClick={() => setActiveTab("tags")} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === "tags" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}>Tags</button>
      </div>

      {(isErrorLabels || isErrorTags) && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">Failed to load labels or tags</p>
          <button onClick={() => { refetchLabels(); refetchTags(); }} className="ml-auto text-sm text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {activeTab === "labels" && (labels.length === 0 && !loadingLabels ? <EmptyState title="No labels" description="Create product labels like 'New', 'Sale', 'Best Seller'." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded-lg transition-colors">Add Label</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "color", label: "Color", render: (item) => <span className="inline-block w-6 h-6 rounded border" style={{ backgroundColor: (item as Label).color }} /> },
          { key: "slug", label: "Slug" },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{((item as Label)._count?.products ?? 0)}</span> },
        ]} data={labels} isLoading={loadingLabels} actions={(row) => <><button onClick={() => openEdit(row as Label)} className="p-1.5 text-neutral-400 hover:text-neutral-600"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete((row as Label).id)} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />)}

      {activeTab === "tags" && (tags.length === 0 && !loadingTags ? <EmptyState title="No tags" description="Create search tags for products." action={<button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 text-sm rounded-lg transition-colors">Add Tag</button>} />
        : <DataTable columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "slug", label: "Slug" },
          { key: "_count", label: "Products", render: (item) => <span className="text-xs bg-neutral-100 px-2 py-1 rounded">{((item as TagItem)._count?.products ?? 0)}</span> },
        ]} data={tags} isLoading={loadingTags} actions={(row) => <>
          <button onClick={() => openEdit(row as TagItem)} className="p-1.5 text-neutral-400 hover:text-neutral-600"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete((row as TagItem).id)} className="p-1.5 text-neutral-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
        </>} />)}

      <Modal open={showModal} title={edit ? `Edit ${activeTab === "labels" ? "Label" : "Tag"}` : `Create ${activeTab === "labels" ? "Label" : "Tag"}`} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          <div><label className="block text-xs text-neutral-500 mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors" /></div>
          {activeTab === "labels" && <div><label className="block text-xs text-neutral-500 mb-1">Color</label><div className="flex gap-2 items-center"><input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" /><span className="text-xs text-neutral-400">{form.color}</span></div></div>}
          <div className="text-[10px] text-neutral-400">Slug is auto-generated from name</div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button onClick={() => setShowModal(false)} type="button" className="border border-neutral-200 px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">Cancel</button>
          <button onClick={handleSave} type="button" disabled={saveMutation.isPending} className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50">{saveMutation.isPending ? "Saving..." : "Save"}</button>
        </div>
      </Modal>
    </div>
  );
}
