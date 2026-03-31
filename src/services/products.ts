import { api } from "./api";
import type { Product, PaginatedResponse, ProductFilters } from "@/types";

export const productService = {
  getAll(filters?: ProductFilters) {
    const params: Record<string, string> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params[key] = String(value);
      });
    }
    return api.get<PaginatedResponse<Product>>("/products", params);
  },

  getById(id: string) {
    return api.get<Product>(`/products/${id}`);
  },

  create(data: Partial<Product>) {
    return api.post<Product>("/products", data);
  },

  update(id: string, data: Partial<Product>) {
    return api.patch<Product>(`/products/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/products/${id}`);
  },
};
