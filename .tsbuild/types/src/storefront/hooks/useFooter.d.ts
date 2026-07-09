export interface FooterSection {
    id: string;
    column: number;
    title: string;
    contentType: string;
    content?: Record<string, unknown>;
    sortOrder: number;
}
export declare function useFooter(): import("@tanstack/react-query").UseQueryResult<NoInfer<FooterSection[]>, Error>;
