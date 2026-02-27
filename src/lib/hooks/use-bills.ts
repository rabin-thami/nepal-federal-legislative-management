import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bill,
  BillsResponse,
  BillWithDetails,
} from "@/lib/types";

// Base fetch function
async function fetchBills(
  filters?: {
    house?: string;
    status?: string;
    ministry?: string;
    limit?: number;
  },
): Promise<Bill[]> {
  const params = new URLSearchParams({
    limit: (filters?.limit ?? 100).toString(),
  });
  if (filters?.house) params.set("house", filters.house);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.ministry) params.set("ministry", filters.ministry);

  const res = await fetch(`/api/bills?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch bills");
  const json = (await res.json()) as BillsResponse;
  return json.data;
}

async function fetchBill(id: string): Promise<BillWithDetails> {
  const res = await fetch(`/api/bills/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Bill not found");
    throw new Error("Failed to fetch bill");
  }
  const json = await res.json();
  return json.data;
}

// Hook for fetching all bills
export function useBills(
  filters?: {
    house?: string;
    status?: string;
    ministry?: string;
    limit?: number;
  },
) {
  return useQuery({
    queryKey: ["bills", filters],
    queryFn: () => fetchBills(filters),
    staleTime: 60_000, // 1 minute
  });
}

// Hook for fetching a single bill by ID
export function useBill(id: string | null | undefined) {
  return useQuery({
    queryKey: ["bill", id],
    queryFn: () => fetchBill(id!),
    enabled: !!id,
    staleTime: 60_000, // 1 minute
  });
}

// Hook for invalidating bills cache
export function useInvalidateBills() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({
      queryKey: ["bills"],
    });
}

// Hook for prefetching a bill
export function usePrefetchBill() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ["bill", id],
      queryFn: () => fetchBill(id),
      staleTime: 60_000,
    });
  };
}

// Export types for use in components
export type { Bill, BillsResponse, BillWithDetails };
