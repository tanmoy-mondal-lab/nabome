import { useState, useCallback } from "react";
import { ChevronRight, Folder, FolderOpen, MoreVertical } from "lucide-react";

interface FolderNode {
  path: string;
  name: string;
  children?: FolderNode[];
  expanded?: boolean;
}

interface FolderTreeProps {
  folders: FolderNode[];
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function FolderTree({
  folders,
  currentPath,
  onNavigate,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const renderFolder = useCallback((node: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = currentPath === node.path;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.path} className="select-none">
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors group ${
            isActive
              ? "bg-brand-100 text-brand-700"
              : "text-neutral-600 hover:bg-neutral-100"
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onNavigate(node.path)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.path);
              }}
              className="p-0.5 hover:bg-neutral-200 rounded transition-colors"
            >
              <ChevronRight
                size={14}
                className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          ) : (
            <span className="w-4" />
          )}
          {isExpanded ? (
            <FolderOpen size={16} className="text-brand-500" />
          ) : (
            <Folder size={16} className="text-neutral-400" />
          )}
          <span className="flex-1 text-sm truncate">{node.name}</span>
          
          {/* Context menu trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Show context menu
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 rounded transition-all"
          >
            <MoreVertical size={14} />
          </button>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="mt-0.5">
            {node.children!.map(child => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [expandedFolders, currentPath, toggleExpand, onNavigate]);

  return (
    <div className="p-2">
      {folders.map(folder => renderFolder(folder))}
    </div>
  );
}
