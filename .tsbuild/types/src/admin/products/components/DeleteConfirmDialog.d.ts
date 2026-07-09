interface DeleteConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    productName: string;
    loading?: boolean;
}
export declare function DeleteConfirmDialog({ open, onClose, onConfirm, productName, loading }: DeleteConfirmDialogProps): import("react").JSX.Element;
export {};
