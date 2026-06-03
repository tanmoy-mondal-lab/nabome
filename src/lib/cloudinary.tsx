export type UploadResult = {
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
};

export async function uploadImage(file: File, folder = "nabome"): Promise<UploadResult> {
  try {
    const response = await fetch("/api/cloudinary-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get upload parameters");
    }

    const { apiKey, timestamp, signature, params, uploadUrl } = await response.json();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });

    const uploadResponse = await fetch(uploadUrl, { method: "POST", body: formData });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    return uploadResponse.json();
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    // Fallback to local blob URL if upload fails
    return {
      url: URL.createObjectURL(file),
      secure_url: URL.createObjectURL(file),
      public_id: `local_${Date.now()}`,
      width: 0, height: 0, format: file.type.split("/")[1] || "jpg",
    };
  }
}

export async function uploadImages(files: File[], folder = "nabome"): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}

export async function deleteImage(_publicId: string): Promise<void> {
  // Delete requires server-side implementation with API secret
  console.warn("Cloudinary delete should be done server-side for security");
}

export function getCloudinaryUrl(publicId: string, transformations?: string): string {
  // Cloud name should be configured server-side or in env
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicId;
  const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const tx = transformations ? `${transformations}/` : "";
  return `${base}/${tx}${publicId}`;
}

export default function CloudinaryUpload({ onUpload, multiple, accept, folder }: {
  onUpload: (results: UploadResult[]) => void;
  multiple?: boolean;
  accept?: string;
  folder?: string;
}) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const results = await uploadImages(Array.from(files), folder);
      onUpload(results);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <label style={{ cursor: "pointer", display: "inline-block" }}>
      <input
        type="file"
        hidden
        multiple={multiple}
        accept={accept || "image/*"}
        onChange={handleChange}
      />
      {null}
    </label>
  );
}
