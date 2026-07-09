export declare const breakpoints: {
    readonly xs: 0;
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
    readonly "2xl": 1536;
};
export type Breakpoint = keyof typeof breakpoints;
export declare function useBreakpoint(breakpoint: Breakpoint): boolean;
export declare function useMediaQuery(query: string): boolean;
export declare function useViewport(): {
    width: number;
    height: number;
};
export declare function getBreakpoint(width: number): Breakpoint;
export declare function isMobile(width: number): boolean;
export declare function isTablet(width: number): boolean;
export declare function isDesktop(width: number): boolean;
