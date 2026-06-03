export type UploadResult = {
  url: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
};

export async function uploadImage(file: File, folder = "nabome"): Promise<UploadResult> {
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
}

export async function uploadImages(files: File[], folder = "nabome"): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}
