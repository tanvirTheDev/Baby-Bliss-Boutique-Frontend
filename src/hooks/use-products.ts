"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { productService, type ListProductsParams } from "@/services/products";
import { toast } from "sonner";

export function useProducts(filters?: ListProductsParams) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getAll(filters),
    placeholderData: keepPreviousData,
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
    onError: (err: {
      message?: string;
      errors?: Record<string, string[] | undefined>;
    }) => {
      const flat = err.errors ? Object.values(err.errors).flat().filter(Boolean) : [];
      const first = flat[0] as string | undefined;
      toast.error(first ?? err.message ?? "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      productService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      toast.success("Product updated");
    },
    onError: (err: {
      message?: string;
      errors?: Record<string, string[] | undefined>;
    }) => {
      const flat = err.errors ? Object.values(err.errors).flat().filter(Boolean) : [];
      const first = flat[0] as string | undefined;
      toast.error(first ?? err.message ?? "Failed to update product");
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

export function useAddProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      file,
      ...opts
    }: {
      productId: string;
      file: File;
      altText?: string;
      isPrimary?: boolean;
      order?: number;
    }) => productService.addProductImage(productId, file, opts),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Image added");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to add image");
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      productService.deleteProductImage(productId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Image removed");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to remove image");
    },
  });
}

export function useSetPrimaryProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      productService.setPrimaryProductImage(productId, imageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Primary image updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to set primary image");
    },
  });
}
