import { useEffect, useState, useCallback, useRef } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { SafeImage } from "../../components/SafeImage";
import {
  Upload, Trash2, Copy, Image, Folder, Search, File, Film,
  FileText, X, Plus, Check, Edit3, Download,
} from "lucide-react";

interface Asset {
  id: string;
  url: string;
  type: string;
  mimeType: string;
  altText: string;
  tags: string[];
  folder: string;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  format: string;
  createdAt: string;
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ file: File; folder: string }[]>([]);
  const [preview, setPreview] = useState<Asset | null>(null);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [dragOver, setDragOver] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState({ altText: "", folder: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {};
      if (search) params.search = search;
      if (selectedFolder !== "all") params.folder = selectedFolder;
      const res = await adminApi.getMedia(params);
      setAssets((res.assets as Asset[]) ?? []);
      setFolders((res.folders as { name: string; count: number }[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [search, selectedFolder]);

  useEffect(() => { fetch(); }, [fetch]);

  const doUpload = async (files: { file: File; folder: string }[]) => {
    setUploading(true);
    let completed = 0;
    for (const item of files) {
      try {
        const res = await adminApi.uploadFile(item.file, item.folder, item.file.name);
        const assetType = getAssetType(res.mimeType || item.file.type);
        await adminApi.createMedia({
          url: res.url,
          publicId: res.publicId,
          type: assetType,
          altText: item.file.name,
          folder: item.folder,
          width: res.width,
          height: res.height,
          fileSize: res.bytes,
          mimeType: res.mimeType || item.file.type,
        });
        completed++;
      } catch { /* ignore */ }
    }
    setUploading(false);
    setUploadModalOpen(false);
    setUploadQueue([]);
    if (completed > 0) fetch();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const queue = files.map((file) => ({ file, folder: uploadFolder }));
    setUploadQueue(queue);
    setUploadModalOpen(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    const queue = files.map((file) => ({ file, folder: uploadFolder }));
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

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteMedia(id);
      fetch();
    } catch { /* ignore */ }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const addNewFolder = () => {
    const name = newFolderName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;
    setSelectedFolder(name);
    setUploadFolder(name);
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

  const openUploadModal = () => {
    setUploadFolder(uploadFolder);
    fileRef.current?.click();
  };

  const openEdit = (asset: Asset) => {
    setEditAsset(asset);
    setEditForm({ altText: asset.altText, folder: asset.folder || "general" });
  };

  const saveEdit = async () => {
    if (!editAsset) return;
    try {
      await adminApi.updateMedia(editAsset.id, {
        altText: editForm.altText,
        folder: editForm.folder,
      });
      setEditAsset(null);
      fetch();
    } catch { /* ignore */ }
  };

  const confirmUpload = () => {
    doUpload(uploadQueue);
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500";

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
            <p className="text-xs text-neutral-400 mt-1">Images, Videos, PDF — up to 50MB each</p>
          </div>
        )}
      </div>

      {/* Folder nav */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button key="all" onClick={() => setSelectedFolder("all")}
          className={`shrink-0 px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
            selectedFolder === "all" ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
          }`}>
          All
        </button>
        {folders.map((f) => (
          <button key={f.name} onClick={() => setSelectedFolder(f.name)}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-full border font-medium transition-colors ${
              selectedFolder === f.name ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
            }`}>
            {f.name} ({f.count})
          </button>
        ))}
        {showNewFolderInput ? (
          <div className="flex items-center gap-1 shrink-0">
            <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name" className="w-28 px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && addNewFolder()} autoFocus />
            <button onClick={addNewFolder} className="p-1 text-green-600"><Check size={14} /></button>
            <button onClick={() => { setShowNewFolderInput(false); setNewFolderName(""); }} className="p-1 text-neutral-400"><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setShowNewFolderInput(true)}
            className="shrink-0 px-3 py-1.5 text-xs rounded-full border border-dashed border-neutral-300 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 font-medium">
            <Plus size={14} className="inline mr-1" />New Folder
          </button>
        )}
      </div>

      {/* Search + Upload folder selector */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input type="text" placeholder="Search assets…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Folder size={14} />
          <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)}
            className="border border-neutral-200 rounded px-2 py-1.5 text-sm focus:outline-none">
            <option value="general">Upload to: general</option>
            {folders.map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets grid */}
      {loading ? (
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
                    <SafeImage src={asset.url} alt={asset.altText} className="w-full h-full object-cover" useTransform={false} />
                  ) : asset.type === "video" ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-neutral-900">
                      <video src={asset.url} className="w-full h-full object-cover opacity-70" />
                      <Film size={32} className="absolute text-white/60" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                      <Icon size={32} />
                      <span className="text-[10px] mt-1 uppercase">{asset.format || "file"}</span>
                    </div>
                  )}
                </div>
                {asset.folder && (
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Folder size={8} />{asset.folder}
                  </div>
                )}
                <div className="px-2 py-1.5">
                  <p className="text-[11px] text-neutral-500 truncate">{asset.altText || "Untitled"}</p>
                  <p className="text-[10px] text-neutral-400">{formatSize(asset.fileSize)}</p>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={(e) => { e.stopPropagation(); copyUrl(asset.url); }}
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
          <label className="text-xs text-neutral-500">Folder:</label>
          <select value={uploadFolder} onChange={(e) => {
            setUploadFolder(e.target.value);
            setUploadQueue((prev) => prev.map((q) => ({ ...q, folder: e.target.value })));
          }} className="flex-1 px-2 py-1.5 text-sm border border-neutral-200 rounded focus:outline-none">
            <option value="general">general</option>
            {folders.filter((f) => f.name !== "general").map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => { setUploadModalOpen(false); setUploadQueue([]); }}
            className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
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
              <SafeImage src={preview.url} alt={preview.altText}
                className="w-full max-h-96 object-contain bg-neutral-50 rounded" useTransform={false} />
            ) : preview.type === "video" ? (
              <video src={preview.url} controls className="w-full max-h-96 rounded bg-neutral-900" />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-neutral-50 rounded text-neutral-400">
                <FileText size={48} />
                <p className="mt-2 text-sm">PDF Document</p>
                <a href={preview.url} target="_blank" rel="noopener noreferrer"
                  className="mt-2 text-brand-600 text-sm hover:underline">Open file</a>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <p><span className="text-neutral-400">Name:</span> <span className="text-neutral-900">{preview.altText || "—"}</span></p>
              <p><span className="text-neutral-400">Type:</span> <span className="capitalize">{preview.type}</span></p>
              <p><span className="text-neutral-400">Dimensions:</span> {preview.width && preview.height ? `${preview.width}×${preview.height}` : "—"}</p>
              <p><span className="text-neutral-400">Size:</span> {formatSize(preview.fileSize)}</p>
              <p><span className="text-neutral-400">Format:</span> {preview.format || "—"}</p>
              <p><span className="text-neutral-400">Folder:</span> {preview.folder || "—"}</p>
              {preview.tags?.length > 0 && (
                <p className="col-span-2"><span className="text-neutral-400">Tags:</span> {preview.tags.join(", ")}</p>
              )}
              <div className="col-span-2">
                <p className="text-neutral-400 mb-1">URL:</p>
                <code className="text-xs bg-neutral-100 px-2 py-1 rounded break-all block">{preview.url}</code>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(preview.url); }}
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
              <label className="block text-xs text-neutral-500 mb-1">Alt Text / Name</label>
              <input value={editForm.altText} onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Folder</label>
              <select value={editForm.folder} onChange={(e) => setEditForm({ ...editForm, folder: e.target.value })}
                className={inputClass}>
                <option value="general">general</option>
                {folders.filter((f) => f.name !== "general").map((f) => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditAsset(null)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
              <button onClick={saveEdit} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
