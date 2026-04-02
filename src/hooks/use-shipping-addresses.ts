"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  shippingAddressService,
  type CreateShippingAddressInput,
  type UpdateShippingAddressInput,
} from "@/services/shipping-addresses";

export function useShippingAddress(id: string) {
  return useQuery({
    queryKey: ["shipping-address", id],
    queryFn: async () => {
      const res = await shippingAddressService.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useUserShippingAddresses(userId: string) {
  return useQuery({
    queryKey: ["users", userId, "shipping-addresses"],
    queryFn: async () => {
      const res = await shippingAddressService.getByUser(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useCreateShippingAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShippingAddressInput) => shippingAddressService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Shipping address created");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to create shipping address");
    },
  });
}

export function useUpdateShippingAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; data: UpdateShippingAddressInput }) =>
      shippingAddressService.update(p.id, p.data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["shipping-address", vars.id] });
      toast.success("Shipping address updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update shipping address");
    },
  });
}

export function useDeleteShippingAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shippingAddressService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Shipping address deleted");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to delete shipping address");
    },
  });
}
