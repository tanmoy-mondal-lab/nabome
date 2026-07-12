import { useEffect, useRef, useState } from "react";
import { Copy, Download, Trash2, Edit3, Move, FileText, Image as ImageIcon, Film, Folder } from "lucide-react";

interface ContextMenuItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  const [adjustedX, setAdjustedX] = useState(x);
  const [adjustedY, setAdjustedY] = useState(y);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - 10;
      const maxY = window.innerHeight - rect.height - 10;
      
      setAdjustedX(Math.min(x, maxX));
      setAdjustedY(Math.min(y, maxY));
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50 min-w-[180px]"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="border-t border-neutral-200 my-1" />;
        }
        return (
          <button
            key={index}
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
              item.danger
                ? "text-red-600 hover:bg-red-50"
                : "text-neutral-700 hover:bg-neutral-100"
            } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface UseContextMenuReturn {
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;
  showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
  hideContextMenu: () => void;
}

export function useContextMenu(): UseContextMenuReturn {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

  const showContextMenu = (x: number, y: number, items: ContextMenuItem[]) => {
    setContextMenu({ x, y, items });
  };

  const hideContextMenu = () => {
    setContextMenu(null);
  };

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };
}

// Helper functions to generate context menu items
export function getFolderContextMenuItems(
  onRename: () => void,
  onDelete: () => void,
  onCreateSubfolder: () => void
): ContextMenuItem[] {
  return [
    {
      label: "Rename",
      icon: <Edit3 size={16} />,
      onClick: onRename,
    },
    {
      label: "New Subfolder",
      icon: <Folder size={16} />,
      onClick: onCreateSubfolder,
    },
    { divider: true },
    {
      label: "Delete",
      icon: <Trash2 size={16} />,
      onClick: onDelete,
      danger: true,
    },
  ];
}

export function getAssetContextMenuItems(
  asset: any,
  onCopyUrl: () => void,
  onCopyHTML: () => void,
  onCopyMarkdown: () => void,
  onDownload: () => void,
  onRename: () => void,
  onMove: () => void,
  onDelete: () => void,
  onAddToFavorites: () => void
): ContextMenuItem[] {
  const Icon = asset.resource_type === "image" ? ImageIcon : asset.resource_type === "video" ? Film : FileText;

  return [
    {
      label: "Copy URL",
      icon: <Copy size={16} />,
      onClick: onCopyUrl,
    },
    {
      label: "Copy HTML",
      icon: <Copy size={16} />,
      onClick: onCopyHTML,
    },
    {
      label: "Copy Markdown",
      icon: <Copy size={16} />,
      onClick: onCopyMarkdown,
    },
    { divider: true },
    {
      label: "Download",
      icon: <Download size={16} />,
      onClick: onDownload,
    },
    { divider: true },
    {
      label: "Rename",
      icon: <Edit3 size={16} />,
      onClick: onRename,
    },
    {
      label: "Move",
      icon: <Move size={16} />,
      onClick: onMove,
    },
    {
      label: "Add to Favorites",
      icon: <Icon size={16} />,
      onClick: onAddToFavorites,
    },
    { divider: true },
    {
      label: "Delete",
      icon: <Trash2 size={16} />,
      onClick: onDelete,
      danger: true,
    },
  ];
}
