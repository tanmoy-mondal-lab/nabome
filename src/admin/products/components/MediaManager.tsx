import { useRef, useState } from "react";
import { Plus, Film, X, ImageIcon, Upload, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SafeImage } from "../../../components/SafeImage";
import { adminApi } from "../../../lib/api/admin";
import type { ProductImage } from "../hooks/useProductForm";

interface MediaManagerProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  uploadingMedia: boolean;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  onPendingImage: (data: { url: string; publicId: string; variantId?: string } | null) => void;
}

export function MediaManager({
  images,
  onChange,
  uploadingMedia,
  onUploadStart,
  onUploadEnd,
  onPendingImage,
}: MediaManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function addImage(file: File) {
    onUploadStart();
    adminApi
      .uploadFile(file, "products")
      .then((res) => {
        onPendingImage({ url: res.url, publicId: res.publicId });
      })
      .catch(() => {})
      .finally(() => {
        onUploadEnd();
        if (fileInputRef.current) fileInputRef.current.value = "";
      });
  }

  function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadStart();
    adminApi
      .uploadFile(file, "product-videos", file.name)
      .then((res) => {
        onChange([
          ...images,
          { url: res.url, isPrimary: images.length === 0, sortOrder: images.length, type: "video" },
        ]);
      })
      .catch(() => {})
      .finally(() => {
        onUploadEnd();
        if (videoFileRef.current) videoFileRef.current.value = "";
      });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) addImage(file);
  }

  function setPrimary(idx: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })));
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <ImageIcon size={14} className="text-neutral-400" />
          <h2 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Media</h2>
          {images.length > 0 && (
            <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full">
              {images.length}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingMedia}
            className="flex items-center gap-1 text-[10px] font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-2.5 py-1 rounded-md hover:bg-white transition-all disabled:opacity-40"
          >
            <Plus size={10} /> Image
          </button>
          <button
            onClick={() => videoFileRef.current?.click()}
            disabled={uploadingMedia}
            className="flex items-center gap-1 text-[10px] font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-2.5 py-1 rounded-md hover:bg-white transition-all disabled:opacity-40"
          >
            <Film size={10} /> Video
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); }} />
          <input ref={videoFileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideoUpload} />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`px-5 py-4 transition-colors ${dragOver ? "bg-blue-50 border-b border-blue-200" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {images.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence>
              {images.map((img, i) => {
                const isVideo = (img.type as string) === "video" || (img.url as string).match(/\.(mp4|webm|mov|avi)(\?|$)/i);
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    layout
                    className="relative group aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden border-2 transition-colors"
                    style={{ borderColor: img.isPrimary ? "#1B2A4A" : "transparent" }}
                  >
                    {isVideo ? (
                      <div className="relative w-full h-full bg-neutral-900">
                        <video src={img.url as string} className="w-full h-full object-cover opacity-80" />
                        <Film size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/60" />
                      </div>
                    ) : (
                      <SafeImage src={img.url as string} alt="" className="w-full h-full object-cover" useTransform={false} />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-2 gap-1">
                      <div className="flex gap-1 w-full">
                        {!img.isPrimary && (
                          <button
                            onClick={() => setPrimary(i)}
                            className="flex-1 flex items-center justify-center gap-1 bg-white/90 text-[10px] font-medium px-1 py-1 rounded shadow-sm hover:bg-white transition-colors"
                          >
                            <Star size={8} /> Primary
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(i)}
                          className="flex-1 bg-red-500/90 text-white text-[10px] font-medium px-1 py-1 rounded shadow-sm hover:bg-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[8px] font-medium px-1 py-0.5 rounded">Primary</span>
                    )}
                    {isVideo && (
                      <span className="absolute top-1 right-1 bg-blue-600 text-white text-[8px] font-medium px-1 py-0.5 rounded flex items-center gap-0.5">
                        <Film size={7} /> Video
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-6">
            <Upload size={20} className="mx-auto text-neutral-300 mb-2" />
            <p className="text-[11px] text-neutral-400">
              Drop images here or{" "}
              <button onClick={() => fileInputRef.current?.click()} className="text-neutral-600 underline underline-offset-2 hover:text-neutral-900">
                browse
              </button>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
