/**
 * Media Upload Component
 *
 * Component for uploading and managing product images/media
 */

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

import { Button } from '@nabome/ui';

interface MediaFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  isPrimary?: boolean;
  altText?: string;
}

interface MediaUploadProps {
  media: MediaFile[];
  onUpload: (files: File[]) => Promise<MediaFile[]>;
  onDelete: (mediaId: string) => void;
  onSetPrimary: (mediaId: string) => void;
  onUpdateAltText: (mediaId: string, altText: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string;
}

export function MediaUpload({
  media,
  onUpload,
  onDelete,
  onSetPrimary,
  onUpdateAltText,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/*',
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [editingAltText, setEditingAltText] = useState<string | null>(null);
  const [altTextValue, setAltTextValue] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files);
        await handleFileUpload(files);
      }
    },
    [media, maxFiles],
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      await handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    // Check if adding files would exceed max
    if (media.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(
        `Files must be smaller than ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await onUpload(files);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleAltTextSave = (mediaId: string) => {
    onUpdateAltText(mediaId, altTextValue);
    setEditingAltText(null);
    setAltTextValue('');
  };

  const handleAltTextCancel = () => {
    setEditingAltText(null);
    setAltTextValue('');
  };

  const handleAltTextEdit = (mediaId: string, currentAltText?: string) => {
    setEditingAltText(mediaId);
    setAltTextValue(currentAltText || '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Product Media</h3>
          <p className="text-sm text-gray-600">
            Upload product images (max {maxFiles} files,{' '}
            {(maxSize / 1024 / 1024).toFixed(1)}MB each)
          </p>
        </div>
        <div className="text-sm text-gray-600">
          {media.length} / {maxFiles} files
        </div>
      </div>

      {/* Upload Area */}
      {media.length < maxFiles && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="media-upload"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <label htmlFor="media-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
              )}
              <p className="text-lg font-medium text-gray-700">
                {isUploading
                  ? 'Uploading...'
                  : 'Drop files here or click to upload'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {isUploading ? `${uploadProgress}%` : 'PNG, JPG, GIF up to 5MB'}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Media Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className={`relative group border rounded-lg overflow-hidden ${
                item.isPrimary ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Image Preview */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={item.url}
                  alt={item.altText || item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Primary Badge */}
              {item.isPrimary && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!item.isPrimary && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSetPrimary(item.id)}
                  >
                    Set Primary
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAltTextEdit(item.id, item.altText)}
                >
                  Alt Text
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 text-xs">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-gray-500">{formatFileSize(item.size)}</p>
                {!item.altText && (
                  <p className="text-amber-600 font-medium mt-1">
                    Missing alt text
                  </p>
                )}
              </div>

              {/* Alt Text Editor */}
              {editingAltText === item.id && (
                <div className="absolute inset-0 bg-white p-3 flex flex-col">
                  <label
                    htmlFor={`alt-text-${item.id}`}
                    className="text-xs font-medium mb-1"
                  >
                    Alt Text (required for accessibility)
                  </label>
                  <textarea
                    id={`alt-text-${item.id}`}
                    value={altTextValue}
                    onChange={(e) => setAltTextValue(e.target.value)}
                    className="flex-1 text-xs border rounded p-2 resize-none"
                    placeholder="Describe this image for screen readers"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAltTextSave(item.id)}
                      disabled={!altTextValue.trim()}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAltTextCancel}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {media.length === 0 && !isUploading && (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No media uploaded yet</p>
          <p className="text-sm text-gray-500">
            Upload product images to get started
          </p>
        </div>
      )}
    </div>
  );
}
