import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { createOrder, updateOrderStatus, getOrdersByCustomer, type OrderData } from "../lib/db";

type DeliveryRecord = Record<string, unknown>;

type DeliveryContextType = {
  creating: boolean;
  error: string | null;
  createDelivery: (data: OrderData) => Promise<string | null>;
  getDeliveries: (customerId: string) => Promise<DeliveryRecord[]>;
  updateStatus: (billNo: string, status: string) => Promise<void>;
};

const DeliveryContext = createContext<DeliveryContextType | null>(null);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDelivery = useCallback(async (data: OrderData): Promise<string | null> => {
    setCreating(true);
    setError(null);
    try {
      const billNo = await createOrder(data);
      if (!billNo) throw new Error("Failed to create order");
      return billNo;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create order";
      setError(msg);
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const getDeliveries = useCallback(async (customerId: string): Promise<DeliveryRecord[]> => {
    const data = await getOrdersByCustomer(customerId);
    return data || [];
  }, []);

  const updateStatus = useCallback(async (billNo: string, status: string) => {
    await updateOrderStatus(billNo, status);
  }, []);

  return (
    <DeliveryContext.Provider value={{ creating, error, createDelivery, getDeliveries, updateStatus }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery(): DeliveryContextType {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used within a DeliveryProvider");
  return ctx;
}
