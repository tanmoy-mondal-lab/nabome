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
export declare function FolderTree({ folders, currentPath, onNavigate, }: FolderTreeProps): import("react").JSX.Element;
export {};
