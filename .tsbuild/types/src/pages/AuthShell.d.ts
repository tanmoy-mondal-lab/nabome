import { type ReactNode } from "react";
interface AuthShellProps {
    title: string;
    subtitle: string;
    heroTitle: string;
    heroSubtitle: string;
    children: ReactNode;
}
export declare function AuthShell({ title, subtitle, heroTitle, heroSubtitle, children }: AuthShellProps): import("react").JSX.Element;
export {};
