import { api } from "./api";
import { env } from "@/config/env";

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  publicId?: string | null;
  isPrimary: boolean;
  order: number;
}

export interface BackendProductVariant {
  id: string;
  sku: string;
  ageRange: string;
  /** Price for this age range. Pricing lives on the variant, not the product. */
  price: number;
  stock: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface BackendProduct {
  id: string;
  userId: string;
  name: string;
  description: string;
  /** Lowest variant price. Denormalised by the API for listing and sorting. */
  minPrice: number;
  /** Highest variant price. Equal to minPrice when every age costs the same. */
  maxPrice: number;
  discount?: number | null;
  categoryId: string;
  gender?: string;
  category?: { id: string; name: string; slug?: string };
  /** Derived from variants in UI; may be absent on older payloads */
  ageRange?: string[];
  tags: string[];
  /** @deprecated Total stock lives on variants; use totalVariantStock() */
  stock?: number;
  rating?: number | null;
  reviewsCount?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants?: BackendProductVariant[];
  reviews?: unknown[];
}

export interface ProductListResponse {
  success?: boolean;
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

/** Matches backend `listProductFiltersSchema` query params */
export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  gender?: string;
  tags?: string[];
  /** Backend accepts a single age range filter */
  ageRange?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  isActive?: boolean;
  sortBy?: "price" | "createdAt" | "name" | "rating";
  /** Backend field name */
  sortOrder?: "asc" | "desc";
  /** Alias for `sortOrder` (storefront / legacy) */
  sortDir?: "asc" | "desc";
  /** Alias for `inStockOnly` */
  inStock?: boolean;
}

/** Cheapest sellable age range, used for "from ৳X" on cards. */
export function displayPrice(product: BackendProduct): number {
  return product.minPrice;
}

/** True when age ranges are not all the same price, so cards must say "from". */
export function hasPriceRange(product: BackendProduct): boolean {
  return product.maxPrice > product.minPrice;
}

/** Price after the product-level discount percentage. */
export function applyDiscount(price: number, discount?: number | null): number {
  if (discount == null || discount <= 0) return price;
  return parseFloat((price - (price * discount) / 100).toFixed(2));
}

export function totalVariantStock(product: BackendProduct): number {
  const fromVariants = product.variants?.reduce((s, v) => s + v.stock, 0);
  if (fromVariants !== undefined && product.variants && product.variants.length > 0) {
    return fromVariants;
  }
  return product.stock ?? 0;
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

function buildProductListQuery(filters?: ListProductsParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (!filters) return sp;

  const {
    tags,
    ageRange,
    sortBy: rawSortBy,
    sortDir,
    sortOrder,
    inStock,
    inStockOnly,
    ...rest
  } = filters;

  const sortBy = rawSortBy === "rating" ? "createdAt" : (rawSortBy ?? "createdAt");
  const resolvedSortOrder = sortOrder ?? sortDir ?? "desc";
  const resolvedInStock = inStockOnly ?? inStock;

  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    sp.append(key, String(value));
  });

  sp.append("sortBy", sortBy);
  sp.append("sortOrder", resolvedSortOrder);

  if (resolvedInStock !== undefined && resolvedInStock !== null) {
    sp.append("inStockOnly", String(resolvedInStock));
  }

  tags?.forEach((t) => sp.append("tags", t));

  if (ageRange !== undefined && ageRange !== null && ageRange !== "") {
    sp.append("ageRange", ageRange);
  }

  return sp;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({
      message: res.statusText || "Request failed",
    }));
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const productService = {
  getAll(filters?: ListProductsParams) {
    const sp = buildProductListQuery(filters);
    const qs = sp.toString();
    return api.get<ProductListResponse>(qs ? `/products?${qs}` : "/products");
  },

  getById(id: string) {
    return api.get<SingleProductResponse>(`/products/${id}`);
  },

  getRelated(id: string) {
    return api.get<{ success?: boolean; data: BackendProduct[] }>(
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

  async addProductImage(
    productId: string,
    file: File,
    options?: { altText?: string; isPrimary?: boolean; order?: number }
  ) {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append("image", file);
    if (options?.altText) formData.append("altText", options.altText);
    formData.append("isPrimary", String(options?.isPrimary ?? false));
    formData.append("order", String(options?.order ?? 0));

    const res = await fetch(`${env.API_BASE_URL}/products/${productId}/images`, {
      method: "POST",
      headers,
      body: formData,
    });

    return parseJsonResponse<{ message: string; data: ProductImage }>(res);
  },

  async deleteProductImage(productId: string, imageId: string) {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(
      `${env.API_BASE_URL}/products/${productId}/images/${imageId}`,
      { method: "DELETE", headers }
    );

    return parseJsonResponse<{ message: string }>(res);
  },

  async setPrimaryProductImage(productId: string, imageId: string) {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(
      `${env.API_BASE_URL}/products/${productId}/images/${imageId}/primary`,
      { method: "PATCH", headers }
    );

    return parseJsonResponse<{ message: string; data: ProductImage }>(res);
  },
};
