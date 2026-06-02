const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export type UploadResult = {
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
};

function isConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

export async function uploadImage(file: File, folder = "nabome"): Promise<UploadResult> {
  if (!isConfigured()) {
    return {
      url: URL.createObjectURL(file),
      secure_url: URL.createObjectURL(file),
      public_id: `local_${Date.now()}`,
      width: 0, height: 0, format: file.type.split("/")[1] || "jpg",
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET!);
  if (folder) formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Upload failed");
  }

  return response.json();
}

export async function uploadImages(files: File[], folder = "nabome"): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!isConfigured()) return;
  // Note: Delete requires API key/secret - typically done server-side
  console.warn("Cloudinary delete should be done server-side for security");
}

export function getCloudinaryUrl(publicId: string, transformations?: string): string {
  if (!CLOUDINARY_CLOUD_NAME) return publicId;
  const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
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
