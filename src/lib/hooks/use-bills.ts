import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bill, BillsResponse, BillWithDetails } from "@/lib/types";
import {
  billsResponseSchema,
  billWithDetailsResponseSchema,
} from "@/lib/validation/responses";

export type BillFilters = {
  house?: string;
  status?: string;
  category?: string;
  ministry?: string;
  year?: string;
  search?: string;
  sort?: "newest" | "oldest" | "status";
  limit?: number;
  offset?: number;
};

// Base fetch function
async function fetchBills(filters?: BillFilters): Promise<BillsResponse> {
  const params = new URLSearchParams({
    limit: (filters?.limit ?? 25).toString(),
    offset: (filters?.offset ?? 0).toString(),
  });
  if (filters?.house) params.set("house", filters.house);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.ministry) params.set("ministry", filters.ministry);
  if (filters?.year) params.set("year", filters.year);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.sort) params.set("sort", filters.sort);

  const res = await fetch(`/api/bills?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch bills");
  const json = await res.json();
  const parsed = billsResponseSchema.parse(json);
  return parsed;
}

async function fetchBill(id: string): Promise<BillWithDetails> {
  const res = await fetch(`/api/bills/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Bill not found");
    throw new Error("Failed to fetch bill");
  }
  const json = await res.json();
  const parsed = billWithDetailsResponseSchema.parse(json);
  return parsed.data;
}

// Hook for fetching all bills
export function useBills(filters?: BillFilters) {
  return useQuery({
    queryKey: ["bills", filters],
    queryFn: () => fetchBills(filters),
    staleTime: 60_000, // 1 minute
    placeholderData: (prev) => prev,
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
