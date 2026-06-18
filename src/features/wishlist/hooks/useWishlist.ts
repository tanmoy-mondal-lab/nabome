import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../../../lib/api/customer";

export function useWishlist() {
  return useQuery({
    queryKey: ["customer", "wishlist"],
    queryFn: () => customerApi.getWishlist(),
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variantId: string) => customerApi.addToWishlist(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variantId: string) => customerApi.removeFromWishlist(variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
    },
  });
}
