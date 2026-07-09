import { type ReactNode } from "react";
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}
export declare function Modal({ open, onClose, title, children, size }: ModalProps): import("react").JSX.Element | null;
export {};
