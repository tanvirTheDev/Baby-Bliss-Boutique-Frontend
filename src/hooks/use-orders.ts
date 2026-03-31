"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orders";

export function useOrders(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.getAll(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
}
