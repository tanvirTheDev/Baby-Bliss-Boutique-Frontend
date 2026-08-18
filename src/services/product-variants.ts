import { api } from "./api";

export interface ProductVariantRow {
  id: string;
  sku: string;
  ageRange: string;
  /** Price for this age range. */
  price: number;
  stock: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VariantsListResponse {
  success: boolean;
  data: ProductVariantRow[];
}

export interface VariantMutationResponse {
  success: boolean;
  message?: string;
  data: ProductVariantRow;
}

export interface AdjustStockBody {
  adjustments: { variantId: string; add: number; remove: number }[];
}

export type StockStatusLevel = "ADEQUATE" | "LOW" | "OUT_OF_STOCK" | "NOT_STOCKED";

export interface StockSummary {
  totalStock: number;
  stockStatus: StockStatusLevel;
  variantCount: number;
  adequateStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockVariants: {
    stock: number;
    reorderLevel: number;
    ageRange: string;
    sku: string;
  }[];
  outOfStockVariants: {
    stock: number;
    reorderLevel: number;
    ageRange: string;
    sku: string;
  }[];
}

export interface StockSummaryResponse {
  success: boolean;
  data: StockSummary;
}

export interface VariantWithProduct extends ProductVariantRow {
  product?: {
    id: string;
    name: string;
    images?: { url: string; isPrimary?: boolean }[];
  };
}

export interface LowOutStockResponse {
  success: boolean;
  data: VariantWithProduct[];
}

export const productVariantService = {
  listByProduct(productId: string) {
    return api.get<VariantsListResponse>(`/variants/products/${productId}`);
  },

  create(body: {
    productId: string;
    ageRange: string;
    price: number;
    stock?: number;
    reorderLevel?: number;
    isActive?: boolean;
  }) {
    return api.post<VariantMutationResponse>("/variants", body);
  },

  update(
    id: string,
    body: Partial<{
      price: number;
      stock: number;
      reorderLevel: number;
      isActive: boolean;
    }>
  ) {
    return api.patch<VariantMutationResponse>(`/variants/${id}`, body);
  },

  delete(id: string) {
    return api.delete<{ success: boolean; message?: string }>(`/variants/${id}`);
  },

  adjustStock(body: AdjustStockBody) {
    return api.patch<{ success: boolean; message?: string; data: unknown }>(
      "/variants/stock/adjust",
      body
    );
  },

  stockSummary(productId: string) {
    return api.get<StockSummaryResponse>(`/variants/stock-summary/${productId}`);
  },

  lowStock() {
    return api.get<LowOutStockResponse>("/variants/stock/low");
  },

  outOfStock() {
    return api.get<LowOutStockResponse>("/variants/stock/out");
  },
};
