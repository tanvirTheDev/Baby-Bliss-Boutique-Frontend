"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, type ListProductsParams } from "@/services/products";
import { toast } from "sonner";

export function useProducts(filters?: ListProductsParams) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getAll(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await productService.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useRelatedProducts(id: string) {
  return useQuery({
    queryKey: ["products", "related", id],
    queryFn: async () => {
      const res = await productService.getRelated(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to delete product");
    },
  });
}
