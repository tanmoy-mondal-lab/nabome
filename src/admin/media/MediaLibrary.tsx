import { useState, useRef, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../components/ui/Toast";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { SafeImage } from "../../components/SafeImage";
import {
  Upload, Trash2, Copy, Image, Folder, Search, File, Film,
  FileText, Edit3, Download,
} from "lucide-react";

interface Asset {
  id: string;
  assetId?: string;
  url: string;
  secureUrl?: string;
  publicId?: string;
  type: string;
  resourceType?: string;
  mimeType?: string;
  altText: string | null;
  displayName?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  originalFilename?: string;
  tags: string[];
  folder?: string | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  sortOrder: number;
  isPrimary: boolean;
  format: string;
  createdAt?: string;
  updatedAt?: string;
}

const FILE_ICONS: Record<string, typeof File> = {
  image: Image,
  video: Film,
  document: FileText,
};

const TYPE_ACCEPT = "image/*,video/mp4,video/webm,video/quicktime,video/x-msvideo,application/pdf";

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAssetType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export default function MediaLibrary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedEntityType, setSelectedEntityType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ file: File; entityType: string }[]>([]);
  const [preview, setPreview] = useState<Asset | null>(null);
  const [uploadEntityType, setUploadEntityType] = useState("cms");
  const [dragOver, setDragOver] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState({ altText: "", displayName: "", sortOrder: 0, isPrimary: false });
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<Asset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  const { data: mediaData, isLoading: loading, error: mediaError } = useQuery({
    queryKey: ["admin", "media", debouncedSearch, selectedEntityType],
    queryFn: async () => {
      const params: Record<string, string | number | undefined> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedEntityType !== "all") params.entityType = selectedEntityType;
      try {
        const res = await adminApi.getMedia(params);
        return {
          assets: res.assets ?? [],
          entityTypes: res.folders ?? [],
        };
      } catch (err) {
        console.error("Media library fetch error:", err);
        throw err;
      }
    },
  });

  const assets = mediaData?.assets ?? [];
  const entityTypes = mediaData?.entityTypes ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeleteLoading(true);
      try {
        return await adminApi.deleteMedia(id);
      } finally {
        setDeleteLoading(false);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast("Asset deleted", "success");
    },
    onError: () => {
      toast("Failed to delete asset", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { altText?: string; displayName?: string; sortOrder?: number; isPrimary?: boolean } }) =>
      adminApi.updateMedia(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      setEditAsset(null);
      toast("Asset updated", "success");
    },
    onError: () => {
      toast("Failed to update asset", "error");
    },
  });

  const doUpload = async (files: { file: File; entityType: string }[]) => {
    setUploading(true);
    let completed = 0;
    let failed = 0;
    for (const item of files) {
      try {
        const slug = `upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const entityId = crypto.randomUUID();
        await adminApi.uploadFile(item.file, item.entityType, slug, entityId, item.file.name);
        completed++;
      } catch (err) {
        failed++;
        if (import.meta.env.DEV) console.warn("Upload failed:", err);
      }
    }
    setUploading(false);
    setUploadModalOpen(false);
    setUploadQueue([]);
    if (completed > 0) {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    }
    if (completed > 0 && failed > 0) {
      toast(`${completed} uploaded, ${failed} failed`, "error");
    } else if (completed > 0) {
      toast(`${completed} file${completed !== 1 ? "s" : ""} uploaded`, "success");
    } else if (failed > 0) {
      toast(`Upload failed — ${failed} file${failed !== 1 ? "s" : ""} not uploaded`, "error");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const queue = files.map((file) => ({ file, entityType: uploadEntityType }));
    setUploadQueue(queue);
    setUploadModalOpen(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    const queue = files.map((file) => ({ file, entityType: uploadEntityType }));
    setUploadQueue(queue);
    setUploadModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDelete = (id: string) => {
    const asset = assets.find(a => a.id === id);
    if (asset) setDeleteConfirmAsset(asset);
  };

  const confirmDelete = () => {
    if (deleteConfirmAsset) {
      deleteMutation.mutate(deleteConfirmAsset.id);
      setDeleteConfirmAsset(null);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast("URL copied to clipboard", "success");
    } catch {
      toast("Failed to copy URL", "error");
    }
  };

  const openUploadModal = () => {
    fileRef.current?.click();
  };

  const openEdit = (asset: Asset) => {
    setEditAsset(asset);
    setEditForm({
      altText: asset.altText || "",
      displayName: asset.displayName || "",
      sortOrder: asset.sortOrder || 0,
      isPrimary: asset.isPrimary || false,
    });
  };

  const saveEdit = () => {
    if (!editAsset) return;
    const data: Record<string, unknown> = { altText: editForm.altText };
    if (editForm.displayName) data.displayName = editForm.displayName;
    data.sortOrder = editForm.sortOrder;
    data.isPrimary = editForm.isPrimary;
    updateMutation.mutate({ id: editAsset.id, data: data as { altText?: string; displayName?: string; sortOrder?: number; isPrimary?: boolean } });
  };

  const confirmUpload = () => {
    void doUpload(uploadQueue);
  };

  return (
    <div ref={dropRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Media Library</h1>
          <p className="text-sm text-neutral-500 mt-1">Upload, manage, and organize your media assets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openUploadModal}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800">
            <Upload size={16} /> {uploading ? "Uploading…" : "Upload"}
          </button>
          <input ref={fileRef} type="file" accept={TYPE_ACCEPT} multiple className="hidden" onChange={handleFileSelect} />
        </div>
      </div>

      {/* Drag-and-drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-neutral-300 hover:border-neutral-400 bg-white"
        }`}
        onClick={() => fileRef.current?.click()}
      >
        {dragOver ? (
          <p className="text-brand-600 font-medium">Drop files here</p>
        ) : (
          <div>
            <Upload size={32} className="mx-auto text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-500">
              <span className="font-medium text-neutral-600">Click to browse</span> or drag & drop files here
            </p>
            <p className="text-xs text-neutral-400 mt-1">Images, Videos, PDF — up to 20MB each</p>
          </div>
        )}
      </div>

      {/* Entity type nav */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button key="all" onClick={() => setSelectedEntityType("all")}
          className={`shrink-0 px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
            selectedEntityType === "all" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
          }`}>
          All
        </button>
        {entityTypes.map((f) => (
          <button key={f.name} onClick={() => setSelectedEntityType(f.name)}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
              selectedEntityType === f.name ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
            }`}>
            {f.name} ({f.count})
          </button>
        ))}
      </div>

      {/* Search + Upload entity type selector */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Search assets…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-label="Search media assets" />
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Folder size={14} />
          <select value={uploadEntityType} onChange={(e) => setUploadEntityType(e.target.value)}
            className="border border-neutral-200 rounded px-2 py-1.5 text-sm focus:outline-none">
            <option value="cms">Upload to: cms</option>
            {entityTypes.filter((f) => f.name !== "cms").map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets grid */}
      {mediaError ? (
        <div className="flex items-center justify-center h-64">
          <div className="premium-card rounded-2xl px-6 py-5 flex flex-col items-center gap-3 shadow-subtle border border-red-200 bg-red-50">
            <span className="text-sm text-red-600">Failed to load media. Please try again.</span>
            <span className="text-xs text-red-500">
              {mediaError instanceof Error ? mediaError.message : "Unknown error"}
            </span>
            <button 
              onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin", "media"] })}
              className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Image} title="No assets yet"
            description="Drag & drop files or click Upload"
            action={<button onClick={openUploadModal} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Upload</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {assets.map((asset) => {
            const Icon = FILE_ICONS[asset.type] || File;
            return (
              <div key={asset.id} className="group relative bg-white border border-neutral-200 rounded overflow-hidden">
                <div className="aspect-square bg-neutral-100 cursor-pointer" onClick={() => setPreview(asset)}>
                  {asset.type === "image" ? (
                    <SafeImage src={asset.url} alt={asset.altText || ""} className="w-full h-full object-cover" useTransform={false} />
                  ) : asset.type === "video" ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-neutral-900">
                      <video src={asset.url} className="w-full h-full object-cover opacity-70"
                        onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }} />
                      <Film size={32} className="absolute text-white/60" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                      <Icon size={32} />
                      <span className="text-[10px] mt-1 uppercase">{asset.format || "file"}</span>
                    </div>
                  )}
                </div>
                {asset.entityType && (
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Folder size={8} />{asset.entityType}
                  </div>
                )}
                <div className="px-2 py-1.5">
                  <p className="text-[11px] text-neutral-500 truncate">{asset.altText || "Untitled"}</p>
                  <p className="text-[10px] text-neutral-400">{formatSize(asset.fileSize)}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 p-1.5 bg-black/50 md:bg-black/0 md:group-hover:bg-black/30 transition-colors md:opacity-0 md:group-hover:opacity-100 md:inset-0">
                  <button onClick={(e) => { e.stopPropagation(); void copyUrl(asset.url); }}
                    className="text-white text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded flex items-center gap-1">
                    <Copy size={10} /> URL
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(asset); }}
                    className="text-white text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded">
                    <Edit3 size={10} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
                    className="text-white text-[10px] bg-red-500/80 hover:bg-red-500 px-2 py-1 rounded">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload confirmation modal */}
      <Modal open={uploadModalOpen && !uploading} onClose={() => { setUploadModalOpen(false); setUploadQueue([]); }}
        title={`Upload ${uploadQueue.length} file${uploadQueue.length !== 1 ? "s" : ""}`} size="sm">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {uploadQueue.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-neutral-50 rounded text-sm">
              <span className="text-neutral-400 text-xs font-mono w-8">#{i + 1}</span>
              <span className="flex-1 truncate text-neutral-700">{item.file.name}</span>
              <span className="text-xs text-neutral-400">{formatSize(item.file.size)}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 rounded capitalize text-neutral-600">{getAssetType(item.file.type)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <label className="text-xs text-neutral-500">Entity Type:</label>
          <select value={uploadEntityType} onChange={(e) => {
            setUploadEntityType(e.target.value);
            setUploadQueue((prev) => prev.map((q) => ({ ...q, entityType: e.target.value })));
          }} className="flex-1 px-2 py-1.5 text-sm border border-neutral-200 rounded focus:outline-none">
            <option value="cms">cms</option>
            {entityTypes.filter((f) => f.name !== "cms").map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => { setUploadModalOpen(false); setUploadQueue([]); }}
            className="px-4 py-2.5 text-sm text-neutral-500">Cancel</button>
          <button onClick={confirmUpload}
            className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
            Upload {uploadQueue.length} file{uploadQueue.length !== 1 ? "s" : ""}
          </button>
        </div>
      </Modal>

      {/* Upload progress modal */}
      <Modal open={uploading} onClose={() => {}} title="Uploading…" size="sm">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-neutral-500">Uploading to Cloudinary…</span>
        </div>
      </Modal>

      {/* Preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="Asset Preview" size="lg">
        {preview && (
          <div className="space-y-4">
            {preview.type === "image" ? (
              <SafeImage src={preview.url} alt={preview.altText || ""}
                className="w-full max-h-96 object-contain bg-neutral-50 rounded" useTransform={false} />
            ) : preview.type === "video" ? (
              <video src={preview.url} controls className="w-full max-h-96 rounded bg-neutral-900"
                onError={(e) => { (e.target as HTMLVideoElement).style.display = "none"; }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-neutral-50 rounded text-neutral-400">
                <FileText size={48} />
                <p className="mt-2 text-sm">PDF Document</p>
                <a href={preview.url} target="_blank" rel="noopener noreferrer"
                  className="mt-2 text-brand-600 text-sm hover:underline">Open file</a>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <p><span className="text-neutral-400">Name:</span> <span className="text-neutral-900">{preview.displayName || preview.altText || "—"}</span></p>
              <p><span className="text-neutral-400">Type:</span> <span className="capitalize">{preview.type}</span></p>
              <p><span className="text-neutral-400">Dimensions:</span> {preview.width && preview.height ? `${preview.width}×${preview.height}` : "—"}</p>
              <p><span className="text-neutral-400">Size:</span> {formatSize(preview.fileSize)}</p>
              <p><span className="text-neutral-400">Format:</span> {preview.format || "—"}</p>
              <p><span className="text-neutral-400">Entity:</span> {preview.entityType || "—"}</p>
              <p><span className="text-neutral-400">Asset ID:</span> <span className="text-xs font-mono">{preview.assetId || "—"}</span></p>
              {preview.tags?.length > 0 && (
                <p className="col-span-2"><span className="text-neutral-400">Tags:</span> {preview.tags.join(", ")}</p>
              )}
              <div className="col-span-2">
                <p className="text-neutral-400 mb-1">URL:</p>
                <code className="text-xs bg-neutral-100 px-2 py-1 rounded break-all block">{preview.url}</code>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { void copyUrl(preview.url); }}
                className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800">
                Copy URL
              </button>
              <a href={preview.url} download target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 px-4 py-2 rounded text-sm font-medium hover:bg-neutral-50">
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit asset modal */}
      <Modal open={!!editAsset} onClose={() => setEditAsset(null)} title="Edit Asset" size="sm">
        {editAsset && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Alt Text</label>
              <input value={editForm.altText} onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Display Name</label>
              <input value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sort Order</label>
              <input type="number" value={editForm.sortOrder} onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPrimary" checked={editForm.isPrimary}
                onChange={(e) => setEditForm({ ...editForm, isPrimary: e.target.checked })} />
              <label htmlFor="isPrimary" className="text-xs text-neutral-500">Primary asset</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditAsset(null)} className="px-4 py-2.5 text-sm text-neutral-500">Cancel</button>
              <button onClick={saveEdit} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteConfirmAsset} onClose={() => setDeleteConfirmAsset(null)} title="Delete Asset" size="sm">
        {deleteConfirmAsset && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete <strong>{deleteConfirmAsset.altText || "this asset"}</strong>?
            </p>
            <p className="text-xs text-red-500">
              This will permanently delete the file from Cloudinary and the database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteConfirmAsset(null)} className="px-4 py-2.5 text-sm text-neutral-500">Cancel</button>
              <button onClick={confirmDelete} disabled={deleteLoading}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
