"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productVariantService, type AdjustStockBody } from "@/services/product-variants";
import { toast } from "sonner";

export function variantListKey(productId: string) {
  return ["product-variants", productId] as const;
}

export function useVariantsByProduct(productId: string) {
  return useQuery({
    queryKey: variantListKey(productId),
    queryFn: async () => {
      const res = await productVariantService.listByProduct(productId);
      return res.data;
    },
    enabled: !!productId,
  });
}

export function useCreateProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productVariantService.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: variantListKey(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant added");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to add variant");
    },
  });
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string;
      productId: string;
      body: Partial<{ reorderLevel: number; isActive: boolean }>;
    }) => productVariantService.update(vars.id, vars.body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: variantListKey(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update variant");
    },
  });
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; productId: string }) =>
      productVariantService.delete(vars.id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: variantListKey(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant removed");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to remove variant");
    },
  });
}

export function useStockSummary(productId: string) {
  return useQuery({
    queryKey: ["stock-summary", productId],
    queryFn: async () => {
      const res = await productVariantService.stockSummary(productId);
      return res.data;
    },
    enabled: !!productId,
  });
}

export function useLowStockVariants() {
  return useQuery({
    queryKey: ["variants", "stock", "low"],
    queryFn: async () => {
      const res = await productVariantService.lowStock();
      return res.data;
    },
  });
}

export function useOutOfStockVariants() {
  return useQuery({
    queryKey: ["variants", "stock", "out"],
    queryFn: async () => {
      const res = await productVariantService.outOfStock();
      return res.data;
    },
  });
}

export function useAdjustVariantStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; body: AdjustStockBody }) =>
      productVariantService.adjustStock(vars.body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: variantListKey(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["stock-summary", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["variants", "stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to adjust stock");
    },
  });
}
