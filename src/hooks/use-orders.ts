"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  orderService,
  type AdminCreateOrderInput,
  type CancelOrderPayload,
  type CreateOrderInput,
  type OrderListParams,
  type PaymentStatus,
  type UpdateOrderStatusPayload,
} from "@/services/orders";

export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.getAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useMyOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: ["orders", "my", params],
    queryFn: () => orderService.getMine(params),
    placeholderData: keepPreviousData,
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

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; data: UpdateOrderStatusPayload }) =>
      orderService.updateStatus(p.id, p.data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", vars.id] });
      toast.success("Order status updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update order status");
    },
  });
}

export function useUpdateOrderPaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; paymentStatus: PaymentStatus }) =>
      orderService.updatePaymentStatus(p.id, p.paymentStatus),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", vars.id] });
      toast.success("Payment status updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update payment status");
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; data: CancelOrderPayload }) =>
      orderService.cancel(p.id, p.data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", vars.id] });
      toast.success("Order cancelled");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to cancel order");
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
