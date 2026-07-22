export interface ContextMenuItem {
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
export declare function ContextMenu({ x, y, items, onClose }: ContextMenuProps): import("react").JSX.Element;
interface UseContextMenuReturn {
    contextMenu: {
        x: number;
        y: number;
        items: ContextMenuItem[];
    } | null;
    showContextMenu: (x: number, y: number, items: ContextMenuItem[]) => void;
    hideContextMenu: () => void;
}
export declare function useContextMenu(): UseContextMenuReturn;
export declare function getFolderContextMenuItems(onRename: () => void, onDelete: () => void, onCreateSubfolder: () => void): ContextMenuItem[];
export declare function getAssetContextMenuItems(asset: {
    resource_type: string;
}, onCopyUrl: () => void, onCopyHTML: () => void, onCopyMarkdown: () => void, onDownload: () => void, onRename: () => void, onMove: () => void, onDelete: () => void, onAddToFavorites: () => void): ContextMenuItem[];
export {};
