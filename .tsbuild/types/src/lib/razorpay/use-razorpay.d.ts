interface OpenRazorpayParams {
    razorpayOrderId: string;
    amount: number;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
}
interface OpenRazorpayResult {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
}
interface RazorpayHookResult {
    loaded: boolean;
    loadError: string | null;
    openRazorpay: (params: OpenRazorpayParams) => Promise<OpenRazorpayResult>;
}
export declare function useRazorpay(): RazorpayHookResult;
export {};
