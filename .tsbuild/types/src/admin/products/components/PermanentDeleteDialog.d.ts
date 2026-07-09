interface PermanentDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    productName: string;
    loading?: boolean;
    count?: number;
}
export declare function PermanentDeleteDialog({ open, onClose, onConfirm, productName, loading, count, }: PermanentDeleteDialogProps): import("react").JSX.Element;
export {};
