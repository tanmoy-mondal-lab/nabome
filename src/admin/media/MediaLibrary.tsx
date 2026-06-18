import { useEffect, useState, useCallback, useRef } from "react";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { Upload, Trash2, Copy, Image, Folder, Search } from "lucide-react";

interface Asset {
  id: string;
  url: string;
  type: string;
  altText: string;
  tags: string[];
  folder: string;
  width: number;
  height: number;
  createdAt: string;
}

export default function MediaLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Asset | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMedia({ search, folder: selectedFolder === "all" ? undefined : selectedFolder });
      setAssets((res.assets as Asset[]) ?? []);
      setFolders((res.folders as { name: string; count: number }[]) ?? []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [search, selectedFolder]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadFile(file);
      await adminApi.createMedia({
        url: res.url,
        type: file.type.startsWith("image") ? "image" : "other",
        altText: file.name,
      });
      fetch();
    } catch { /* ignore */ } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await adminApi.deleteMedia(id);
      fetch();
    } catch { /* ignore */ }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const addUrlManually = async () => {
    const url = window.prompt("Image URL:");
    if (!url) return;
    try {
      await adminApi.createMedia({ url, type: "image", altText: url.split("/").pop() ?? "Image" });
      fetch();
    } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Media Library</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage images and assets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800">
            <Upload size={16} /> {uploading ? "Uploading…" : "Upload"}
          </button>
          <button onClick={addUrlManually}
            className="flex items-center gap-2 border border-neutral-200 text-neutral-600 px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-50">
            + Add URL
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
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
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input type="text" placeholder="Search assets…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </div>

      {/* Assets grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded">
          <EmptyState icon={Image} title="No assets yet" description="Upload images or add URLs"
            action={<button onClick={() => fileRef.current?.click()} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">Upload</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {assets.map((asset) => (
            <div key={asset.id} className="group relative bg-white border border-neutral-200 rounded overflow-hidden">
              <div className="aspect-square bg-neutral-100 cursor-pointer" onClick={() => setPreview(asset)}>
                {asset.type === "image" ? (
                  <img src={asset.url} alt={asset.altText} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-400 text-xs">File</div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={() => copyUrl(asset.url)} className="text-white text-[10px] bg-white/20 px-2 py-1 rounded">
                  <Copy size={12} />
                </button>
                <button onClick={() => handleDelete(asset.id)} className="text-white text-[10px] bg-red-500/80 px-2 py-1 rounded">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Asset Preview" size="md">
        {preview && (
          <div className="space-y-4">
            <img src={preview.url} alt={preview.altText} className="w-full max-h-80 object-contain bg-neutral-50 rounded" />
            <div className="text-sm space-y-1">
              <p><span className="text-neutral-400">URL:</span> <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded break-all">{preview.url}</code></p>
              <p><span className="text-neutral-400">Dimensions:</span> {preview.width}×{preview.height}</p>
              <p><span className="text-neutral-400">Type:</span> {preview.type}</p>
              <p><span className="text-neutral-400">Tags:</span> {preview.tags?.join(", ") || "—"}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(preview.url); }}
              className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium">
              Copy URL
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
