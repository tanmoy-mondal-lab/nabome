import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { placeOrder, getOrdersByUser, updateOrderStatus } from "../lib/api/orders";
import type { PlaceOrderInput } from "../lib/api/orders";

type DeliveryRecord = Record<string, unknown>;

type DeliveryContextType = {
  creating: boolean;
  error: string | null;
  createDelivery: (data: PlaceOrderInput) => Promise<string | null>;
  getDeliveries: (userId: string) => Promise<DeliveryRecord[]>;
  updateStatus: (orderId: string, status: string) => Promise<void>;
};

const DeliveryContext = createContext<DeliveryContextType | null>(null);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDelivery = useCallback(async (data: PlaceOrderInput): Promise<string | null> => {
    setCreating(true);
    setError(null);
    try {
      const result = await placeOrder(data);
      return result?.orderNumber || null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create order";
      setError(msg);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const getDeliveries = useCallback(async (userId: string): Promise<DeliveryRecord[]> => {
    const data = await getOrdersByUser(userId);
    return (data || []) as unknown as DeliveryRecord[];
  }, []);

  const updateStatusFn = useCallback(async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status as any);
  }, []);

  return (
    <DeliveryContext.Provider value={{ creating, error, createDelivery, getDeliveries, updateStatus: updateStatusFn }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery(): DeliveryContextType {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used within a DeliveryProvider");
  return ctx;
}
