interface BulkActionDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    action: "publish" | "archive" | "delete";
    count: number;
    loading?: boolean;
}
export declare function BulkActionDialog({ open, onClose, onConfirm, action, count, loading }: BulkActionDialogProps): import("react").JSX.Element;
export {};
