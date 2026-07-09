interface UseCartEffectsOptions {
    onJustAdded?: (variantId: string) => void;
    clearJustAdded?: () => void;
}
export declare function useCartEffects(justAdded: string | null, options?: UseCartEffectsOptions): {
    triggerHapticSuccess: () => void;
};
export {};
