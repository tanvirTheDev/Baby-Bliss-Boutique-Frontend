import { api } from "./api";
import { env } from "@/config/env";

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  order: number;
}

export interface BackendProduct {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  discount?: number | null;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  ageRange?: string | null;
  tags: string[];
  stock: number;
  rating?: number | null;
  reviewsCount?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  reviews?: unknown[];
}

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: BackendProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SingleProductResponse {
  message: string;
  data: BackendProduct;
}

export interface ListProductsParams {
  categoryId?: string;
  ageRange?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price" | "rating" | "createdAt";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("baby-bliss-auth");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

export const productService = {
  getAll(filters?: ListProductsParams) {
    const params: Record<string, string> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => {
              params[key] = v;
            });
          } else {
            params[key] = String(value);
          }
        }
      });
    }
    return api.get<ProductListResponse>("/products", params);
  },

  getById(id: string) {
    return api.get<SingleProductResponse>(`/products/${id}`);
  },

  getRelated(id: string) {
    return api.get<{ success: boolean; data: BackendProduct[] }>(
      `/products/${id}/related`
    );
  },

  async create(formData: FormData) {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${env.API_BASE_URL}/products`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Upload failed" }));
      throw err;
    }

    return res.json() as Promise<{
      success: boolean;
      message: string;
      data: BackendProduct;
    }>;
  },

  update(id: string, data: Record<string, unknown>) {
    return api.patch<{ success: boolean; message: string; data: BackendProduct }>(
      `/products/${id}`,
      data
    );
  },

  delete(id: string) {
    return api.delete<{ message: string }>(`/products/${id}`);
  },
};
