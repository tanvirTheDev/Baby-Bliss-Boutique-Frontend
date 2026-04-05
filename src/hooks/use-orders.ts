"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  orderService,
  type AdminCreateOrderInput,
  type CreateOrderInput,
  type OrderListParams,
  type UpdateOrderInput,
} from "@/services/orders";

export function useOrders(params?: OrderListParams) {
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

export function useAdminCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCreateOrderInput) => orderService.adminCreate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to create order");
    },
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderInput }) =>
      orderService.update(id, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", vars.id] });
      toast.success("Order updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update order");
    },
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to delete order");
    },
  });
}
