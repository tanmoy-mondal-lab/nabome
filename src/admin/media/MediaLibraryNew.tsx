import { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../components/ui/Toast";
import { adminApi } from "../../lib/api/admin";
import { Modal } from "../common/Modal";
import { EmptyState } from "../common/EmptyState";
import { SafeImage } from "../../components/SafeImage";
import { FolderTree } from "./FolderTree";
import { ContextMenu, getFolderContextMenuItems, getAssetContextMenuItems } from "./ContextMenu";
import {
  Upload, Trash2, Copy, Image, Folder, Search, File, Film,
  FileText, Download, Plus, ChevronRight,
  Home, Grid, List, Check, Move, FolderOpen,
} from "lucide-react";

interface CloudinaryResource {
  public_id: string;
  resource_type: "image" | "video" | "raw" | string;
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  url: string;
  secure_url: string;
  created_at: string;
  filename: string;
  metadata: any;
}

interface CloudinaryFolder {
  path: string;
  name: string;
}

const FILE_ICONS: Record<string, React.ElementType> = {
  image: Image,
  video: Film,
  raw: FileText,
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

const TYPE_ACCEPT = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx";

function getCloudNameFromUrl(url?: string): string {
  const match = (url || "").match(/res\.cloudinary\.com\/([^/]+)\//);
  return match ? match[1] : "";
}

function buildBreadcrumbs(path: string): { name: string; path: string }[] {
  const crumbs = [{ name: "Media Library", path: "" }];
  if (!path) return crumbs;
  const parts = path.split("/");
  let acc = "";
  parts.forEach((part) => {
    acc = acc ? `${acc}/${part}` : part;
    crumbs.push({ name: part, path: acc });
  });
  return crumbs;
}

function isDirectChildOfFolder(publicId: string, folderPath: string): boolean {
  if (!publicId.startsWith(`${folderPath}/`)) return false;
  const rest = publicId.slice(folderPath.length + 1);
  const segments = rest.split("/").filter(Boolean);
  return segments.length <= 2;
}

function generateCloudinaryUrls(publicId: string, cloudName: string, resourceType: string) {
  const baseUrl = `https://res.cloudinary.com/${cloudName}`;
  
  return {
    original: `${baseUrl}/${resourceType}/upload/${publicId}`,
    secure: `${baseUrl}/${resourceType}/upload/${publicId}`,
    optimized: `${baseUrl}/${resourceType}/upload/q_auto,f_auto/${publicId}`,
    webp: `${baseUrl}/${resourceType}/upload/f_webp/${publicId}`,
    avif: `${baseUrl}/${resourceType}/upload/f_avif/${publicId}`,
    autoFormat: `${baseUrl}/${resourceType}/upload/f_auto/${publicId}`,
    autoQuality: `${baseUrl}/${resourceType}/upload/q_auto/${publicId}`,
    thumbnail: `${baseUrl}/${resourceType}/upload/c_thumb,w_200,h_200,g_face/${publicId}`,
    small: `${baseUrl}/${resourceType}/upload/c_scale,w_400/${publicId}`,
    medium: `${baseUrl}/${resourceType}/upload/c_scale,w_800/${publicId}`,
    large: `${baseUrl}/${resourceType}/upload/c_scale,w_1200/${publicId}`,
    blur: `${baseUrl}/${resourceType}/upload/e_blur:1000/${publicId}`,
    grayscale: `${baseUrl}/${resourceType}/upload/e_grayscale/${publicId}`,
    responsive: `${baseUrl}/${resourceType}/upload/f_auto,q_auto,w_auto,c_limit/${publicId}`,
  };
}

export default function MediaLibraryNew() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Folder navigation state
  const [currentPath, setCurrentPath] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([
    { name: "Media Library", path: "" },
  ]);
  
  // UI state
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);

  // Pagination (cursor-based) for large libraries
  const [extraResources, setExtraResources] = useState<CloudinaryResource[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ file: File; status: "pending" | "uploading" | "success" | "error"; progress: number; error?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [previewItem, setPreviewItem] = useState<CloudinaryResource | null>(null);
  const [linkGeneratorItem, setLinkGeneratorItem] = useState<CloudinaryResource | null>(null);
  
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CloudinaryResource | null>(null);
  const [deleteConfirmFolder, setDeleteConfirmFolder] = useState<{ folder: CloudinaryFolder; assetCount: number } | null>(null);
  
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveItems, setMoveItems] = useState<string[]>([]);
  const [moveTargetFolder, setMoveTargetFolder] = useState("");
  
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const bulkActionType = "delete";
  
  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: any[] } | null>(null);
  
  // Drag & drop state
  const [draggedItems, setDraggedItems] = useState<string[]>([]);
  const [draggedType, setDraggedType] = useState<"asset" | "folder" | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  
  // Inline rename state
  const [renamingItem, setRenamingItem] = useState<{ type: "asset" | "folder"; id: string; currentName: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  
  // Asset usage detection state
  const [assetUsage, setAssetUsage] = useState<{ entity: string; count: number; items: string[] } | null>(null);
  
  // Query for asset usage when previewing (mock implementation for now)
  useEffect(() => {
    if (previewItem?.metadata?.id) {
      // Mock usage data - in production, this would come from the API
      const mockUsage = {
        entity: "Products",
        count: Math.floor(Math.random() * 5),
        items: ["Summer Collection", "New Arrivals", "Featured Products"].slice(0, Math.floor(Math.random() * 3))
      };
      setAssetUsage(mockUsage);
    } else {
      setAssetUsage(null);
    }
  }, [previewItem?.metadata?.id]);
  
  // Refs
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  
  // Queries
  const { data: folderContents, isLoading: loadingContents, error: contentsError } = useQuery({
    queryKey: ["admin", "media-folders", "contents", currentPath],
    queryFn: async () => {
      try {
        return await adminApi.getMediaFolderContents(currentPath || "media-library");
      } catch (err) {
        console.error("Media folder contents fetch error:", err);
        throw err;
      }
    },
    enabled: true,
  });
  
  const { data: storageInfo } = useQuery({
    queryKey: ["admin", "media-folders", "storage"],
    queryFn: () => adminApi.getMediaStorageInfo(),
    enabled: true,
  });
  
  const { data: allFolders } = useQuery({
    queryKey: ["admin", "media-folders", "list"],
    queryFn: () => adminApi.getMediaFolders(),
    enabled: true,
  });
  
  const folders = folderContents?.folders || [];
  const resources = [...(folderContents?.resources || []), ...extraResources];

  // Reset accumulated pages whenever the base folder listing changes (new folder, refetch).
  useEffect(() => {
    setExtraResources([]);
    setNextCursor(folderContents?.nextCursor);
  }, [folderContents]);
  
  // Build folder tree structure
  const buildFolderTree = (folderList: { path: string; name: string }[]): any[] => {
    const tree: any[] = [];
    const map = new Map();
    
    folderList.forEach(folder => {
      const parts = folder.path.split("/");
      let current = map;
      
      parts.forEach((part, index) => {
        const currentPath = parts.slice(0, index + 1).join("/");
        
        if (!current.has(part)) {
          const node = { path: currentPath, name: part, children: [] };
          current.set(part, node);
          if (index === 0) {
            tree.push(node);
          } else {
            const parentNode = map.get(parts[index - 1]);
            if (parentNode) {
              parentNode.children.push(node);
            }
          }
        }
        current = map.get(part).children || new Map();
      });
    });
    
    return tree;
  };
  
  const folderTreeNodes = allFolders?.folders ? buildFolderTree(allFolders.folders) : [];
  
  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async (queue: { file: File; status: "pending" | "uploading" | "success" | "error"; progress: number; error?: string }[]) => {
      const folder = currentPath || "media-library";
      let completed = 0;
      
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        setUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: "uploading" as const, progress: 0 } : q));
        
        try {
          await adminApi.uploadMediaToFolder(item.file, folder);
          setUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: "success" as const, progress: 100 } : q));
          completed++;
        } catch (err) {
          setUploadQueue(prev => prev.map((q, idx) => idx === i ? { ...q, status: "error" as const, error: "Upload failed" } : q));
        }
      }
      
      return completed;
    },
    onSuccess: (count) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media-folders", "contents"] });
      toast(`${count} file${count !== 1 ? "s" : ""} uploaded successfully`, "success");
      setUploadModalOpen(false);
      setUploadQueue([]);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast("Upload failed. Please try again.", "error");
    },
  });
  
  const createFolderMutation = useMutation({
    mutationFn: (path: string) => adminApi.createMediaFolder(path),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media-folders", "contents"] });
      toast("Folder created successfully", "success");
      setCreateFolderModalOpen(false);
      setNewFolderName("");
    },
    onError: () => {
      toast("Failed to create folder", "error");
    },
  });
  
  const deleteFolderMutation = useMutation({
    mutationFn: (path: string) => adminApi.deleteMediaFolder(path),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media-folders", "contents"] });
      toast("Folder deleted successfully", "success");
      setDeleteConfirmFolder(null);
    },
    onError: error => {
      console.error("Delete folder error:", error);
      toast("Failed to delete folder", "error");
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteMedia(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media-folders", "contents"] });
      toast("Asset moved to trash", "success");
      setDeleteConfirmItem(null);
      setSelectedItems(new Set());
    },
    onError: () => {
      toast("Failed to delete asset", "error");
    },
  });
  
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => adminApi.bulkDeleteMedia(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media-folders", "contents"] });
      setSelectedItems(new Set());
      toast("Selected items deleted successfully", "success");
      setBulkActionModalOpen(false);
    },
    onError: () => {
      toast("Failed to delete selected items", "error");
    },
  });
  
  const bulkMoveMutation = useMutation({
    mutationFn: ({ assetIds, newFolder }: { assetIds: string[]; newFolder: string }) =>
      adminApi.bulkMoveMedia(assetIds, newFolder),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "media-folders", "contents"] });
      setSelectedItems(new Set());
      toast("Items moved successfully", "success");
      setMoveModalOpen(false);
      setMoveItems([]);
      setMoveTargetFolder("");
    },
    onError: () => {
      toast("Failed to move items", "error");
    },
  });
  
  // Handlers
  const handleNavigateToFolder = useCallback((path: string) => {
    setCurrentPath(path);
    setBreadcrumbs(buildBreadcrumbs(path));
    setSelectedItems(new Set());
  }, []);
  
  const handleNavigateToBreadcrumb = useCallback((path: string, index: number) => {
    setCurrentPath(path);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setSelectedItems(new Set());
  }, []);
  
  const handleNavigateUp = useCallback(() => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      const parentPath = newBreadcrumbs[newBreadcrumbs.length - 1].path;
      setCurrentPath(parentPath);
      setBreadcrumbs(newBreadcrumbs);
    }
  }, [breadcrumbs]);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploadQueue(files.map(file => ({ file, status: "pending" as const, progress: 0 })));
    setUploadModalOpen(true);
    if (fileRef.current) fileRef.current.value = "";
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    setUploadQueue(files.map(file => ({ file, status: "pending" as const, progress: 0 })));
    setUploadModalOpen(true);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);
  
  const handleUpload = useCallback(() => {
    if (uploadQueue.length === 0) return;
    setUploading(true);
    uploadMutation.mutate(uploadQueue);
  }, [uploadQueue, uploadMutation]);
  
  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) return;
    const path = currentPath ? `${currentPath}/${newFolderName.trim()}` : newFolderName.trim();
    createFolderMutation.mutate(path);
  }, [newFolderName, currentPath, createFolderMutation]);
  
  const handleSelectItem = useCallback((publicId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(publicId)) {
        newSet.delete(publicId);
      } else {
        newSet.add(publicId);
      }
      return newSet;
    });
  }, []);
  
  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === resources.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(resources.map(r => r.public_id)));
    }
  }, [selectedItems.size, resources]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await adminApi.getMediaFolderContents(currentPath || "media-library", {
        maxResults: 100,
        nextCursor,
      });
      setExtraResources(prev => [...prev, ...(res.resources || [])]);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error("Load more failed:", err);
      toast("Failed to load more assets", "error");
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, currentPath, toast]);
  
  const handleCopyUrl = useCallback((url: string) => {
    void navigator.clipboard.writeText(url);
    toast("URL copied to clipboard", "success");
  }, [toast]);
  
  const handleCopyHTML = useCallback((url: string, alt: string) => {
    const html = `<img src="${url}" alt="${alt}" />`;
    void navigator.clipboard.writeText(html);
    toast("HTML copied to clipboard", "success");
  }, [toast]);
  
  const handleCopyMarkdown = useCallback((url: string, alt: string) => {
    const markdown = `![${alt}](${url})`;
    void navigator.clipboard.writeText(markdown);
    toast("Markdown copied to clipboard", "success");
  }, [toast]);
  
  const handleCopyCSS = useCallback((url: string) => {
    const css = `background-image: url('${url}');`;
    void navigator.clipboard.writeText(css);
    toast("CSS copied to clipboard", "success");
  }, [toast]);
  
  // Context menu handlers
  const handleFolderContextMenu = useCallback((e: React.MouseEvent, folder: any) => {
    e.preventDefault();
    const folderAssets = resources.filter(r => isDirectChildOfFolder(r.public_id, folder.path));
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: getFolderContextMenuItems(
        () => console.log("Rename folder:", folder.path),
        () => setDeleteConfirmFolder({ folder, assetCount: folderAssets.length }),
        () => console.log("Create subfolder in:", folder.path)
      )
    });
  }, [resources]);

  const handleAssetContextMenu = useCallback((e: React.MouseEvent, resource: any) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: getAssetContextMenuItems(
        resource,
        () => handleCopyUrl(resource.secure_url),
        () => handleCopyHTML(resource.secure_url, resource.filename),
        () => handleCopyMarkdown(resource.secure_url, resource.filename),
        () => window.open(resource.url, "_blank"),
        () => console.log("Rename asset:", resource.public_id),
        () => console.log("Move asset:", resource.public_id),
        () => setDeleteConfirmItem(resource),
        () => console.log("Add to favorites:", resource.public_id)
      )
    });
  }, [handleCopyUrl, handleCopyHTML, handleCopyMarkdown]);
  
  const handleBulkDelete = useCallback(() => {
    const assetIds = Array.from(selectedItems).map(publicId => {
      const resource = resources.find(r => r.public_id === publicId);
      return resource?.metadata?.id || "";
    }).filter(Boolean);
    if (assetIds.length === 0) return;
    bulkDeleteMutation.mutate(assetIds);
  }, [selectedItems, resources, bulkDeleteMutation]);
  
  const handleBulkMove = useCallback(() => {
    const assetIds = Array.from(selectedItems).map(publicId => {
      const resource = resources.find(r => r.public_id === publicId);
      return resource?.metadata?.id || "";
    }).filter(Boolean);
    if (assetIds.length === 0) return;
    setMoveItems(assetIds);
    setMoveModalOpen(true);
  }, [selectedItems, resources]);
  
  const handleMove = useCallback(() => {
    if (moveItems.length === 0 || !moveTargetFolder) return;
    bulkMoveMutation.mutate({ assetIds: moveItems, newFolder: moveTargetFolder });
  }, [moveItems, moveTargetFolder, bulkMoveMutation]);
  
  // Drag & drop handlers for moving assets/folders
  const handleDragStart = useCallback((e: React.DragEvent, itemType: "asset" | "folder", itemId: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedItems([itemId]);
    setDraggedType(itemType);
    if (itemType === "asset" && selectedItems.has(itemId)) {
      setDraggedItems(Array.from(selectedItems));
    }
  }, [selectedItems]);
  
  const handleDragOverFolder = useCallback((e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverFolder(folderPath);
  }, []);
  
  const handleDragLeaveFolder = useCallback(() => {
    setDragOverFolder(null);
  }, []);
  
  const handleDropOnFolder = useCallback((e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    if (draggedItems.length === 0 || !draggedType) return;
    
    if (draggedType === "asset") {
      // Move assets to folder
      const assetIds = draggedItems.map(publicId => {
        const resource = resources.find(r => r.public_id === publicId);
        return resource?.metadata?.id || "";
      }).filter(Boolean);
      
      if (assetIds.length > 0) {
        bulkMoveMutation.mutate({ assetIds, newFolder: targetFolder });
      }
    } else if (draggedType === "folder") {
      // Move folder to folder (not implemented yet - would need backend support)
      toast("Moving folders is not yet supported", "info");
    }
    
    setDraggedItems([]);
    setDraggedType(null);
  }, [draggedItems, draggedType, resources, bulkMoveMutation]);
  
  const handleDragEnd = useCallback(() => {
    setDraggedItems([]);
    setDraggedType(null);
    setDragOverFolder(null);
  }, []);
  
  // Inline rename handlers
  const handleStartRename = useCallback((type: "asset" | "folder", id: string, currentName: string) => {
    setRenamingItem({ type, id, currentName });
    setRenameValue(currentName);
  }, []);
  
  const handleRenameSubmit = useCallback(() => {
    if (!renamingItem || !renameValue.trim()) {
      setRenamingItem(null);
      setRenameValue("");
      return;
    }
    
    if (renamingItem.type === "folder") {
      // Rename folder (would need backend support)
      console.log("Rename folder:", renamingItem.id, "to:", renameValue);
      toast("Folder renaming not yet implemented", "info");
    } else {
      // Rename asset (would need backend support)
      console.log("Rename asset:", renamingItem.id, "to:", renameValue);
      toast("Asset renaming not yet implemented", "info");
    }
    
    setRenamingItem(null);
    setRenameValue("");
  }, [renamingItem, renameValue, toast]);
  
  const handleRenameCancel = useCallback(() => {
    setRenamingItem(null);
    setRenameValue("");
  }, []);
  
  const filteredResources = resources.filter(resource => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      resource.filename.toLowerCase().includes(searchLower) ||
      resource.public_id.toLowerCase().includes(searchLower)
    );
  });
  
  const allItems = [...folders, ...filteredResources];
  
  // Keyboard navigation effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl/Cmd + A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        handleSelectAll();
        return;
      }
      
      // Delete: Delete selected items
      if (e.key === "Delete" && selectedItems.size > 0) {
        e.preventDefault();
        handleBulkDelete();
        return;
      }
      
      // Arrow navigation (focus only — selection via Space / checkbox)
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, Math.min(allItems.length - 1, prev + 1)));
        return;
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, Math.min(allItems.length - 1, prev - 1)));
        return;
      }

      // Space: toggle selection of the focused item
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allItems.length) {
          const item = allItems[focusedIndex];
          if ("public_id" in item) {
            handleSelectItem(item.public_id);
          }
        }
        return;
      }
      
      // Enter: Open preview or navigate to folder
      if (e.key === "Enter" && focusedIndex >= 0 && focusedIndex < allItems.length) {
        e.preventDefault();
        const item = allItems[focusedIndex];
        if ("path" in item) {
          handleNavigateToFolder(item.path);
        } else if ("public_id" in item) {
          setPreviewItem(item as any);
        }
        return;
      }
      
      // F2: Rename focused item
      if (e.key === "F2" && focusedIndex >= 0 && focusedIndex < allItems.length) {
        e.preventDefault();
        const item = allItems[focusedIndex];
        if ("path" in item) {
          handleStartRename("folder", item.path, item.name);
        } else if ("public_id" in item) {
          handleStartRename("asset", item.public_id, item.filename);
        }
        return;
      }
      
      // Escape: Clear selection or cancel rename
      if (e.key === "Escape") {
        if (renamingItem) {
          handleRenameCancel();
        } else {
          setSelectedItems(new Set());
          setFocusedIndex(-1);
        }
        return;
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [allItems, focusedIndex, selectedItems, handleSelectAll, handleBulkDelete, handleSelectItem, handleNavigateToFolder, handleStartRename, handleRenameCancel, renamingItem]);
  
  return (
    <div className="min-h-screen bg-neutral-50" ref={dropRef}>
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl text-neutral-900">Media Library</h1>
            <p className="text-sm text-neutral-500 mt-1">Upload, manage, and organize your media assets</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateFolderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50 transition-colors"
            >
              <Plus size={16} /> New Folder
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2.5 rounded text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              <Upload size={16} /> Upload
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={TYPE_ACCEPT}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && <ChevronRight size={16} className="text-neutral-400 mx-1" />}
              <button
                onClick={() => handleNavigateToBreadcrumb(crumb.path, index)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                  index === breadcrumbs.length - 1
                    ? "text-neutral-900 font-medium bg-neutral-100"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {index === 0 ? <Home size={14} /> : <Folder size={14} />}
                {crumb.name}
              </button>
            </div>
          ))}
          {breadcrumbs.length > 1 && (
            <button
              onClick={handleNavigateUp}
              className="ml-2 text-neutral-500 hover:text-neutral-700 transition-colors"
              title="Go up"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
          )}
        </div>
      </div>
      
      {/* Main content with sidebar */}
      <div className="flex">
        {/* Folder tree sidebar */}
        <div className="w-64 bg-white border-r border-neutral-200 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-sm font-medium text-neutral-700">Folders</h2>
          </div>
          <FolderTree
            folders={folderTreeNodes}
            currentPath={currentPath}
            onNavigate={(path) => handleNavigateToFolder(path)}
          />
        </div>
        
        {/* Main content area */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="bg-white border-b border-neutral-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                
                {/* View toggle */}
                <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors ${viewMode === "grid" ? "bg-neutral-100 text-neutral-900" : "text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${viewMode === "list" ? "bg-neutral-100 text-neutral-900" : "text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
              
              {/* Bulk actions */}
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkMove}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-50 transition-colors"
                  >
                    <Move size={16} /> Move
                  </button>
                  <button
                    onClick={() => setBulkActionModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              )}
              
              {/* Storage info */}
              {storageInfo && (
                <div className="text-sm text-neutral-500">
                  <span>{storageInfo.totalFiles} files</span>
                  <span className="mx-2">•</span>
                  <span>{formatSize(storageInfo.usedStorage)} used</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Drag & drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mx-6 mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
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
              <p className="text-xs text-neutral-400 mt-1">Images, Videos — up to 20MB each</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {contentsError ? (
          <div className="flex items-center justify-center h-64">
            <div className="premium-card rounded-2xl px-6 py-5 flex flex-col items-center gap-3 shadow-subtle border border-red-200 bg-red-50">
              <span className="text-sm text-red-600">Failed to load media. Please try again.</span>
              <span className="text-xs text-red-500">
                {contentsError instanceof Error ? contentsError.message : "Unknown error"}
              </span>
              <button 
                onClick={() => void queryClient.invalidateQueries({ queryKey: ["admin", "media-folders", "contents"] })}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        ) : loadingContents ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : folders.length === 0 && filteredResources.length === 0 ? (
          <div className="mx-6 mt-4 bg-white border border-neutral-200 rounded">
            <EmptyState
              icon={Folder}
              title="This folder is empty"
              description="Upload files or create subfolders to get started"
              action={
                <div className="flex gap-2">
                  <button onClick={() => setCreateFolderModalOpen(true)} className="bg-neutral-900 text-white px-4 py-2 rounded text-sm">
                    Create Folder
                  </button>
                  <button onClick={() => fileRef.current?.click()} className="border border-neutral-200 text-neutral-700 px-4 py-2 rounded text-sm">
                    Upload Files
                  </button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mx-6 mt-4">
            {/* Folders */}
            {folders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Folders</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {folders.map((folder, folderIndex) => (
                    <div
                      key={folder.path}
                      draggable
                      onDragStart={(e) => handleDragStart(e, "folder", folder.path)}
                      onDragEnd={handleDragEnd}
                      onDoubleClick={() => handleNavigateToFolder(folder.path)}
                      onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                      onDragOver={(e) => handleDragOverFolder(e, folder.path)}
                      onDragLeave={handleDragLeaveFolder}
                      onDrop={(e) => handleDropOnFolder(e, folder.path)}
                      className={`group relative bg-white border rounded-lg p-4 cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all ${
                        dragOverFolder === folder.path ? "border-brand-500 ring-2 ring-brand-200" : "border-neutral-200"
                      } ${focusedIndex === folderIndex ? "ring-2 ring-brand-400" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen size={24} className="text-brand-500" />
                        <div className="flex-1 min-w-0">
                          {renamingItem?.type === "folder" && renamingItem.id === folder.path ? (
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={handleRenameSubmit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameSubmit();
                                if (e.key === "Escape") handleRenameCancel();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              className="w-full text-sm font-medium text-neutral-900 border border-brand-500 rounded px-1 py-0.5 focus:outline-none"
                            />
                          ) : (
                            <p 
                              className="text-sm font-medium text-neutral-900 truncate"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartRename("folder", folder.path, folder.name);
                              }}
                            >
                              {folder.name}
                            </p>
                          )}
                          <p className="text-xs text-neutral-500">Folder</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const folderAssets = resources.filter(r => r.public_id.startsWith(folder.path));
                          setDeleteConfirmFolder({ folder, assetCount: folderAssets.length });
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Resources */}
            {filteredResources.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">Files</h3>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filteredResources.map((resource, resourceIndex) => {
                      const Icon = FILE_ICONS[resource.resource_type] || File;
                      const isSelected = selectedItems.has(resource.public_id);
                      const isFocused = focusedIndex === folders.length + resourceIndex;
                      
                      return (
                        <div
                          key={resource.public_id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, "asset", resource.public_id)}
                          onDragEnd={handleDragEnd}
                          onContextMenu={(e) => handleAssetContextMenu(e, resource)}
                          className={`group relative bg-white border rounded-lg overflow-hidden transition-all ${
                            isSelected ? "border-brand-500 ring-2 ring-brand-200" : "border-neutral-200 hover:border-neutral-300"
                          } ${isFocused ? "ring-2 ring-brand-400" : ""}`}
                        >
                          {/* Selection checkbox */}
                          <button
                            onClick={() => handleSelectItem(resource.public_id)}
                            className={`absolute top-2 left-2 z-10 p-1.5 rounded transition-all ${
                              isSelected
                                ? "bg-brand-500 text-white"
                                : "bg-white/80 text-neutral-400 hover:bg-white hover:text-neutral-600"
                            }`}
                          >
                            <Check size={14} />
                          </button>
                          
                          {/* Preview */}
                          <div className="aspect-square bg-neutral-50">
                            {resource.resource_type === "image" ? (
                              <SafeImage
                                src={resource.url}
                                alt={resource.filename}
                                className="w-full h-full object-cover"
                                useTransform={false}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Icon size={32} className="text-neutral-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="p-2">
                            {renamingItem?.type === "asset" && renamingItem.id === resource.public_id ? (
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={handleRenameSubmit}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleRenameSubmit();
                                  if (e.key === "Escape") handleRenameCancel();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="w-full text-xs text-neutral-900 border border-brand-500 rounded px-1 py-0.5 focus:outline-none"
                              />
                            ) : (
                              <p 
                                className="text-xs text-neutral-900 truncate"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartRename("asset", resource.public_id, resource.filename);
                                }}
                              >
                                {resource.filename}
                              </p>
                            )}
                            <p className="text-xs text-neutral-500">{formatSize(resource.bytes)}</p>
                          </div>
                          
                          {/* Actions */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewItem(resource);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-white rounded transition-all"
                            >
                              <Image size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLinkGeneratorItem(resource);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-white rounded transition-all"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmItem(resource);
                              }}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Size</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500">Created</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResources.map((resource, resourceIndex) => {
                          const isSelected = selectedItems.has(resource.public_id);
                          const Icon = FILE_ICONS[resource.resource_type] || File;
                          const isFocused = focusedIndex === folders.length + resourceIndex;
                          
                          return (
                            <tr
                              key={resource.public_id}
                              onContextMenu={(e) => handleAssetContextMenu(e, resource)}
                              className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                                isSelected ? "bg-brand-50" : ""
                              } ${isFocused ? "ring-2 ring-inset ring-brand-400" : ""}`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleSelectItem(resource.public_id)}
                                    className={`p-1.5 rounded transition-all ${
                                      isSelected
                                        ? "bg-brand-500 text-white"
                                        : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                                    }`}
                                  >
                                    <Check size={14} />
                                  </button>
                                  <Icon size={16} className="text-neutral-400" />
                                  <span className="text-sm text-neutral-900">{resource.filename}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-neutral-600 capitalize">{resource.resource_type}</td>
                              <td className="px-4 py-3 text-sm text-neutral-600">{formatSize(resource.bytes)}</td>
                              <td className="px-4 py-3 text-sm text-neutral-600">{new Date(resource.created_at).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setPreviewItem(resource)}
                                    className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
                                  >
                                    <Image size={14} />
                                  </button>
                                  <button
                                    onClick={() => setLinkGeneratorItem(resource)}
                                    className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
                                  >
                                    <Copy size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmItem(resource)}
                                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {nextCursor && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? "Loading\u2026" : "Load more assets"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Upload confirmation modal */}
      <Modal
        open={uploadModalOpen && !uploading}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadQueue([]);
        }}
        title={`Upload ${uploadQueue.length} file${uploadQueue.length !== 1 ? "s" : ""}`}
        size="sm"
      >
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {uploadQueue.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-neutral-50 rounded text-sm">
              <span className="text-neutral-400 text-xs font-mono w-8">#{i + 1}</span>
              <span className="flex-1 truncate text-neutral-700">{item.file.name}</span>
              <span className="text-xs text-neutral-400">{formatSize(item.file.size)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              setUploadModalOpen(false);
              setUploadQueue([]);
            }}
            className="px-4 py-2.5 text-sm text-neutral-500"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Upload {uploadQueue.length} file{uploadQueue.length !== 1 ? "s" : ""}
          </button>
        </div>
      </Modal>
      
      {/* Upload progress modal */}
      <Modal open={uploading} onClose={() => {}} title="Uploading…" size="sm">
        <div className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadQueue.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-neutral-50 rounded text-sm">
                <span className="text-neutral-400 text-xs font-mono w-8">#{i + 1}</span>
                <span className="flex-1 truncate text-neutral-700">{item.file.name}</span>
                <span className="text-xs text-neutral-400">{formatSize(item.file.size)}</span>
                {item.status === "uploading" && (
                  <div className="w-16 bg-neutral-200 rounded-full h-1.5">
                    <div
                      className="bg-brand-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "success" && (
                  <span className="text-green-500 text-xs">✓</span>
                )}
                {item.status === "error" && (
                  <span className="text-red-500 text-xs">✗</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-neutral-500">
              {uploadQueue.filter(q => q.status === "success").length} / {uploadQueue.length} uploaded
            </span>
          </div>
        </div>
      </Modal>
      
      {/* Create folder modal */}
      <Modal
        open={createFolderModalOpen}
        onClose={() => {
          setCreateFolderModalOpen(false);
          setNewFolderName("");
        }}
        title="Create Folder"
        size="sm"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setCreateFolderModalOpen(false);
                setNewFolderName("");
              }}
              className="px-4 py-2.5 text-sm text-neutral-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteConfirmItem}
        onClose={() => setDeleteConfirmItem(null)}
        title="Delete Asset"
        size="sm"
      >
        {deleteConfirmItem && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete <strong>{deleteConfirmItem.filename}</strong>?
            </p>
            {assetUsage && assetUsage.count > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium mb-2">
                  ⚠️ This asset is currently in use
                </p>
                <p className="text-xs text-red-600 mb-2">
                  It is used in {assetUsage.count} place{assetUsage.count !== 1 ? "s" : ""} in {assetUsage.entity}:
                </p>
                <div className="space-y-1">
                  {assetUsage.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-red-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-red-600 mt-2">
                  Deleting it will break those pages.
                </p>
              </div>
            )}
            <p className="text-xs text-red-500">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmItem(null)} className="px-4 py-2.5 text-sm text-neutral-500">
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmItem.metadata?.id || deleteConfirmItem.public_id)}
                disabled={!!assetUsage && assetUsage.count > 0}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete folder confirmation modal */}
      <Modal
        open={!!deleteConfirmFolder}
        onClose={() => setDeleteConfirmFolder(null)}
        title="Delete Folder"
        size="sm"
      >
        {deleteConfirmFolder && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Are you sure you want to delete <strong>{deleteConfirmFolder.folder.name}</strong>?
            </p>
            {deleteConfirmFolder.assetCount > 0 && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                <p className="text-xs text-neutral-600">
                  This folder contains <strong>{deleteConfirmFolder.assetCount}</strong> asset
                  {deleteConfirmFolder.assetCount !== 1 ? "s" : ""}.
                </p>
                <p className="text-xs text-red-500 mt-1">
                  The folder must be empty to be deleted. Please move or delete the assets first.
                </p>
              </div>
            )}
            {deleteConfirmFolder.assetCount === 0 && (
              <p className="text-xs text-neutral-500">
                The folder is empty and can be safely deleted.
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteConfirmFolder(null)} className="px-4 py-2.5 text-sm text-neutral-500">
                Cancel
              </button>
              <button
                onClick={() => deleteFolderMutation.mutate(deleteConfirmFolder.folder.path)}
                disabled={deleteConfirmFolder.assetCount > 0}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Preview modal with full metadata */}
      <Modal
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
        title="Asset Details"
        size="lg"
      >
        {previewItem && (
          <div className="space-y-4">
            {previewItem.resource_type === "image" ? (
              <SafeImage
                src={previewItem.url}
                alt={previewItem.filename}
                className="w-full max-h-96 object-contain bg-neutral-50 rounded"
                useTransform={false}
              />
            ) : previewItem.resource_type === "video" ? (
              <video src={previewItem.url} controls className="w-full max-h-96 rounded bg-neutral-900" />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-neutral-50 rounded text-neutral-400">
                <FileText size={48} />
                <p className="mt-2 text-sm">Document</p>
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-brand-600 text-sm hover:underline"
                >
                  Open file
                </a>
              </div>
            )}
            
            {/* Full metadata panel */}
            <div className="grid grid-cols-2 gap-4 text-sm bg-neutral-50 p-4 rounded-lg">
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Filename</p>
                <p className="text-neutral-900 font-medium">{previewItem.filename}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Type</p>
                <p className="capitalize">{previewItem.resource_type}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Public ID</p>
                <p className="text-neutral-900 font-mono text-xs truncate">{previewItem.public_id}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Format</p>
                <p className="uppercase">{previewItem.format || "—"}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Dimensions</p>
                <p>{previewItem.width && previewItem.height ? `${previewItem.width}×${previewItem.height}` : "—"}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">File Size</p>
                <p>{formatSize(previewItem.bytes)}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Created</p>
                <p>{new Date(previewItem.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Folder</p>
                <p className="truncate">{currentPath || "root"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">Secure URL</p>
                <p className="text-neutral-900 font-mono text-xs truncate">{previewItem.secure_url}</p>
              </div>
              <div className="col-span-2">
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-1">URL</p>
                <p className="text-neutral-900 font-mono text-xs truncate">{previewItem.url}</p>
              </div>
            </div>
            
            {/* Asset usage section */}
            {assetUsage && assetUsage.count > 0 && (
              <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                <p className="text-sm font-medium text-brand-900 mb-2">Used In {assetUsage.entity}</p>
                <p className="text-xs text-brand-700 mb-3">This asset is used in {assetUsage.count} place{assetUsage.count !== 1 ? "s" : ""}:</p>
                <div className="space-y-1">
                  {assetUsage.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-brand-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => handleCopyUrl(previewItem.secure_url)}
                className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-neutral-800"
              >
                Copy URL
              </button>
              <a
                href={previewItem.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 px-4 py-2 rounded text-sm font-medium hover:bg-neutral-50"
              >
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Link generator modal */}
      <Modal
        open={!!linkGeneratorItem}
        onClose={() => setLinkGeneratorItem(null)}
        title="Generate Links"
        size="lg"
      >
        {linkGeneratorItem && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Copy any of these URLs to use this asset in your application.
            </p>
            <div className="space-y-3">
              {Object.entries(
                generateCloudinaryUrls(
                  linkGeneratorItem.public_id,
                  getCloudNameFromUrl(linkGeneratorItem.secure_url || linkGeneratorItem.url),
                  linkGeneratorItem.resource_type
                )
              ).map(([key, url]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-neutral-500 mb-1 block capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded break-all block w-full">
                      {url}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopyUrl(url)}
                    className="mt-4 px-3 py-1.5 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Copy format options */}
            <div className="border-t border-neutral-200 pt-4">
              <p className="text-sm font-medium text-neutral-700 mb-3">Copy as Format</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCopyHTML(linkGeneratorItem.secure_url, linkGeneratorItem.filename)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 rounded hover:bg-neutral-50"
                >
                  <Copy size={14} /> HTML
                </button>
                <button
                  onClick={() => handleCopyMarkdown(linkGeneratorItem.secure_url, linkGeneratorItem.filename)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 rounded hover:bg-neutral-50"
                >
                  <Copy size={14} /> Markdown
                </button>
                <button
                  onClick={() => handleCopyCSS(linkGeneratorItem.secure_url)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 rounded hover:bg-neutral-50"
                >
                  <Copy size={14} /> CSS
                </button>
                <button
                  onClick={() => handleCopyUrl(linkGeneratorItem.secure_url)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 rounded hover:bg-neutral-50"
                >
                  <Copy size={14} /> URL
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Move modal */}
      <Modal
        open={moveModalOpen}
        onClose={() => {
          setMoveModalOpen(false);
          setMoveItems([]);
          setMoveTargetFolder("");
        }}
        title="Move to Folder"
        size="sm"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Target folder path (e.g., media-library/subfolder)"
            value={moveTargetFolder}
            onChange={(e) => setMoveTargetFolder(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setMoveModalOpen(false);
                setMoveItems([]);
                setMoveTargetFolder("");
              }}
              className="px-4 py-2.5 text-sm text-neutral-500"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={!moveTargetFolder}
              className="bg-neutral-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
            >
              Move
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Bulk action confirmation modal */}
      <Modal
        open={bulkActionModalOpen}
        onClose={() => setBulkActionModalOpen(false)}
        title={`Confirm ${bulkActionType}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to {bulkActionType} {selectedItems.size} selected item
            {selectedItems.size !== 1 ? "s" : ""}?
          </p>
          {bulkActionType === "delete" && (
            <p className="text-xs text-red-500">
              This action cannot be undone.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setBulkActionModalOpen(false)}
              className="px-4 py-2.5 text-sm text-neutral-500"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
            >
              {bulkActionType === "delete" ? "Delete" : "Move"}
            </button>
          </div>
        </div>
      </Modal>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
