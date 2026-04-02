"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderService, type CreateOrderInput } from "@/services/orders";

export function useOrders(params?: {
  page?: number;
  limit?: number;
  orderStatus?: string;
  paymentStatus?: string;
}) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.getAll(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) => orderService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed successfully");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to place order");
    },
  });
}
