import { useState, useCallback } from "react";
import { uploadImage, type UploadResult } from "../lib/cloudinary";

type UploadState = {
  uploading: boolean;
  progress: number;
  error: string | null;
  result: UploadResult | null;
};

const defaultState: UploadState = {
  uploading: false,
  progress: 0,
  error: null,
  result: null,
};

export function useCloudinaryUpload(folder = "nabome") {
  const [state, setState] = useState<UploadState>(defaultState);

  const upload = useCallback(async (file: File) => {
    if (!file) return;
    setState({ uploading: true, progress: 0, error: null, result: null });

    try {
      const result = await uploadImage(file, folder);
      setState({ uploading: false, progress: 100, error: null, result });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setState({ uploading: false, progress: 0, error: message, result: null });
      return null;
    }
  }, [folder]);

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    ...state,
    upload,
    reset,
  };
}

export function useCloudinaryUploadMultiple(folder = "nabome") {
  const [state, setState] = useState<{
    uploading: boolean;
    progress: number;
    error: string | null;
    results: UploadResult[];
  }>({ uploading: false, progress: 0, error: null, results: [] });

  const upload = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setState({ uploading: true, progress: 0, error: null, results: [] });

    const results: UploadResult[] = [];
    const total = files.length;

    try {
      for (let i = 0; i < total; i++) {
        const result = await uploadImage(files[i], folder);
        results.push(result);
        setState((prev) => ({
          ...prev,
          progress: Math.round(((i + 1) / total) * 100),
          results: [...results],
        }));
      }
      setState((prev) => ({ ...prev, uploading: false, progress: 100 }));
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setState((prev) => ({ ...prev, uploading: false, error: message }));
      return results;
    }
  }, [folder]);

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null, results: [] });
  }, []);

  return { ...state, upload, reset };
}
