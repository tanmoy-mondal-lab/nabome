import { useRef, type ChangeEvent } from "react";
import { useCloudinaryUpload, useCloudinaryUploadMultiple } from "../../hooks/useCloudinaryUpload";
import type { UploadResult } from "../../lib/cloudinary";

type UploadMode = "single" | "multiple";

type CloudinaryUploadProps = {
  mode?: UploadMode;
  folder?: string;
  accept?: string;
  maxFiles?: number;
  preview?: boolean;
  onSuccess: (results: UploadResult | UploadResult[]) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
};

function UploadPreview({ url }: { url: string }) {
  return (
    <div style={{
      position: "relative",
      width: 120,
      height: 120,
      borderRadius: 8,
      overflow: "hidden",
      border: "1px solid #2a2a2a",
    }}>
      <img
        src={url}
        alt="Preview"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{
      width: "100%",
      height: 4,
      background: "#2a2a2a",
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 8,
    }}>
      <div style={{
        width: `${progress}%`,
        height: "100%",
        background: "#d4af37",
        transition: "width 0.3s ease",
      }} />
    </div>
  );
}

export function SingleUpload({ folder, accept, preview, onSuccess, onError }: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, error, result, upload } = useCloudinaryUpload(folder);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await upload(file);
    if (res) {
      onSuccess(res);
    } else if (error) {
      onError?.(error);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept || "image/*"}
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: "10px 20px",
          background: uploading ? "#2a2a2a" : "#d4af37",
          color: uploading ? "#888" : "#050505",
          border: "none",
          borderRadius: 6,
          cursor: uploading ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {uploading ? `Uploading... ${progress}%` : "Upload Image"}
      </button>
      {uploading && <ProgressBar progress={progress} />}
      {error && <p style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{error}</p>}
      {preview && result && <UploadPreview url={result.secure_url} />}
    </div>
  );
}

export function MultipleUpload({ folder, accept, maxFiles = 10, preview, onSuccess, onError }: CloudinaryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, error, results, upload } = useCloudinaryUploadMultiple(folder);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles);
    if (!files.length) return;
    const res = await upload(files);
    if (res && res.length) {
      onSuccess(res);
    }
    if (error) {
      onError?.(error);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept || "image/*"}
        multiple
        onChange={handleChange}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          padding: "10px 20px",
          background: uploading ? "#2a2a2a" : "#d4af37",
          color: uploading ? "#888" : "#050505",
          border: "none",
          borderRadius: 6,
          cursor: uploading ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {uploading ? `Uploading... ${progress}%` : `Upload Images (max ${maxFiles})`}
      </button>
      {uploading && <ProgressBar progress={progress} />}
      {error && <p style={{ color: "#e74c3c", fontSize: 12, marginTop: 4 }}>{error}</p>}
      {preview && results.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {results.map((r, i) => (
            <UploadPreview key={i} url={r.secure_url} />
          ))}
        </div>
      )}
    </div>
  );
}
