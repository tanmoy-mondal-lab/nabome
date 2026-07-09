interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
}
export declare function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel, cancelLabel, variant, }: ConfirmDialogProps): import("react").JSX.Element | null;
export {};
