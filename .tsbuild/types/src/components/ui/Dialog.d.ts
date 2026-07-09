interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}
export declare function Dialog({ isOpen, onClose, title, children, size }: DialogProps): import("react").JSX.Element | null;
interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}
export declare function DialogFooter({ children, className }: DialogFooterProps): import("react").JSX.Element;
export {};
