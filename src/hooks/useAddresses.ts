import { useState, useEffect, useCallback } from "react";
import { addressesApi, type Address, type AddressInput } from "../lib/api/addresses";
import { ApiError } from "../lib/api/client";

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await addressesApi.list();
      setAddresses(res.addresses);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const create = useCallback(async (data: AddressInput) => {
    setError(null);
    try {
      const address = await addressesApi.create(data);
      setAddresses((prev) => [address, ...prev]);
      return address;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create address");
      throw err;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<AddressInput>) => {
    setError(null);
    try {
      const updated = await addressesApi.update(id, data);
      setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update address");
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await addressesApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete address");
      throw err;
    }
  }, []);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  return { addresses, defaultAddress, isLoading, error, create, update, remove, refresh: fetchAddresses };
};
