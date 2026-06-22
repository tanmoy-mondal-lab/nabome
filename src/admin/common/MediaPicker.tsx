import { useState, useRef, useCallback } from "react";
import { Upload, ImageOff, X, Loader2, FileUp } from "lucide-react";
import { adminApi } from "../../lib/api/admin";

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  accept?: string;
  preview?: boolean;
  placeholder?: string;
}

export function MediaPicker({
  value, onChange, label, folder = "general",
  accept = "image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,image/bmp,image/tiff",
  preview = true, placeholder = "Paste image URL or upload",
}: MediaPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [broken, setBroken] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  const doUpload = useCallback(async (file: File) => {
    if (file.size > MAX_SIZE) {
      setError("File exceeds 50MB limit");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const res = await adminApi.uploadFile(file, folder);
      onChange(res.url);
    } catch {
      setError("Upload failed — try again");
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    doUpload(file);
    if (fileRef.current) fileRef.current.value = "";
  }, [doUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) doUpload(file);
  }, [doUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  return (
    <div>
      {label && <label className="block text-xs text-neutral-500 mb-1">{label}</label>}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex items-center gap-2 border rounded transition-colors ${
          dragOver ? "border-brand-500 bg-brand-50" : "border-neutral-200"
        } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          type="text" value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border-0 bg-transparent focus:outline-none"
        />
        <div className="flex items-center gap-1 pr-1">
          {value && preview && (
            <div className="relative w-8 h-8 bg-neutral-100 rounded overflow-hidden shrink-0 group">
              {broken ? (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff size={14} className="text-neutral-400" />
                </div>
              ) : (
                <img src={value} alt=""
                  className="w-full h-full object-cover"
                  onError={() => setBroken(true)} onLoad={() => setBroken(false)} />
              )}
              <button type="button" onClick={() => { onChange(""); setBroken(false); }}
                className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 text-white hidden group-hover:flex items-center justify-center rounded-bl"
              ><X size={8} /></button>
            </div>
          )}
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-neutral-200 rounded hover:bg-neutral-50 disabled:opacity-50 whitespace-nowrap"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-50/90 rounded pointer-events-none">
            <div className="flex flex-col items-center gap-1 text-brand-600">
              <FileUp size={20} />
              <span className="text-xs font-medium">Drop file to upload</span>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleFileSelect} />
    </div>
  );
}
