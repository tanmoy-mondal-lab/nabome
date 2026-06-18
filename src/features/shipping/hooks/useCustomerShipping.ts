import { useQuery } from "@tanstack/react-query";
import { customerApi } from "../../../lib/api/customer";

export function useShippingRates(params: { pincode: string; subtotal: number }) {
  return useQuery({
    queryKey: ["shipping", "rates", params],
    queryFn: () => customerApi.getShippingRates(params),
    enabled: !!params.pincode && params.pincode.length === 6,
  });
}
