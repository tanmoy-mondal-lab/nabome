import { type ReactNode } from "react";
interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}
interface ToastContextValue {
    toast: (message: string, type?: Toast["type"]) => void;
}
export declare function useToast(): ToastContextValue;
export declare function Toaster({ children }: {
    children?: ReactNode;
}): import("react").JSX.Element;
export {};
