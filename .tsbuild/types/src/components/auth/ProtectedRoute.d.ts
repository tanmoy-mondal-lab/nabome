import { type ReactNode } from "react";
interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}
export declare function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps): import("react").JSX.Element;
export {};
