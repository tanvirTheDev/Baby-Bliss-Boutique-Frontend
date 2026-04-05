"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  couponService,
  type ListCouponsParams,
  type CreateCouponBody,
  type UpdateCouponBody,
} from "@/services/coupons";
import { toast } from "sonner";

export function useCoupons(filters?: ListCouponsParams) {
  return useQuery({
    queryKey: ["coupons", filters],
    queryFn: () => couponService.list(filters),
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: ["coupon", id],
    queryFn: async () => {
      const res = await couponService.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCouponBody) => couponService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon created");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to create coupon");
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponBody }) =>
      couponService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      queryClient.invalidateQueries({ queryKey: ["coupon"] });
      toast.success("Coupon updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update coupon");
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: couponService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon deleted");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to delete coupon");
    },
  });
}

export function useToggleCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: couponService.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon status updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to toggle coupon");
    },
  });
}
