interface ErrorPageProps {
    code: number;
    title: string;
    message: string;
    showHomeButton?: boolean;
    showBackButton?: boolean;
}
export declare function ErrorPage({ code, title, message, showHomeButton, showBackButton }: ErrorPageProps): import("react").JSX.Element;
export declare function NotFoundPage(): import("react").JSX.Element;
export declare function UnauthorizedPage(): import("react").JSX.Element;
export declare function ForbiddenPage(): import("react").JSX.Element;
export declare function ServerErrorPage(): import("react").JSX.Element;
export declare function MaintenancePage(): import("react").JSX.Element;
export {};
