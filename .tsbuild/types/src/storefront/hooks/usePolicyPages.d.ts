interface PolicyPage {
    id: string;
    title: string;
    slug: string;
}
export declare function usePolicyPages(): import("@tanstack/react-query").UseQueryResult<NoInfer<PolicyPage[]>, Error>;
export {};
