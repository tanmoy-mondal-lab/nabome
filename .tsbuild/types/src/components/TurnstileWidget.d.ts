type TurnstileWidgetApi = {
    render: (container: HTMLElement, options: {
        sitekey: string;
        action?: string;
        theme?: "auto" | "light" | "dark";
        size?: "normal" | "compact";
        callback?: (token: string) => void;
        "error-callback"?: () => void;
        "expired-callback"?: () => void;
    }) => string;
    reset: (widgetId?: string) => void;
    remove?: (widgetId: string) => void;
    ready: (callback: () => void) => void;
};
declare global {
    interface Window {
        turnstile?: TurnstileWidgetApi;
    }
}
interface TurnstileWidgetProps {
    siteKey: string;
    onTokenChange: (token: string) => void;
    onError?: (message: string) => void;
    action?: string;
    size?: "normal" | "compact";
    theme?: "auto" | "light" | "dark";
    className?: string;
}
export declare function TurnstileWidget({ siteKey, onTokenChange, onError, action, size, theme, className, }: TurnstileWidgetProps): import("react").JSX.Element | null;
export {};
