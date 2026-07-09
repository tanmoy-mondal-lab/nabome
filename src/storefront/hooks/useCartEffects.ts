import { useEffect } from "react";
import { hapticSuccess } from "../../lib/utils/haptic";

interface UseCartEffectsOptions {
  onJustAdded?: (variantId: string) => void;
  clearJustAdded?: () => void;
}

export function useCartEffects(
  justAdded: string | null,
  options: UseCartEffectsOptions = {}
) {
  // Clear "just added" indicator after 2 seconds
  useEffect(() => {
    if (justAdded && options.clearJustAdded) {
      const timer = setTimeout(() => {
        options.clearJustAdded?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
     
  }, [justAdded, options.clearJustAdded]);

  const triggerHapticSuccess = () => {
    hapticSuccess();
  };

  return {
    triggerHapticSuccess,
  };
}
