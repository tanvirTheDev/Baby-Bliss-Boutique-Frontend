import { api } from "./api";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maximumDiscount?: number | null;
  minimumOrderAmount?: number | null;
  usageLimit?: number | null;
  perUserLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { couponUsages: number };
  applicableProducts?: { product: { id: string; name: string } }[];
}

export interface ListCouponsParams {
  isActive?: boolean;
  discountType?: DiscountType;
  sortBy?: "createdAt" | "expiresAt" | "usedCount" | "discountValue";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface CouponListResponse {
  success: boolean;
  message: string;
  data: Coupon[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SingleCouponResponse {
  success: boolean;
  message: string;
  data: Coupon;
}

export type CreateCouponBody = {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maximumDiscount?: number;
  minimumOrderAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
  expiresAt?: string;
  productIds?: string[];
};

export type UpdateCouponBody = Partial<
  Omit<CreateCouponBody, "code"> & { productIds?: string[] | null }
>;

function toQueryParams(filters?: ListCouponsParams): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters) return params;
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params[key] = String(value);
  });
  return params;
}

export interface ValidateCouponCartBody {
  couponCode: string;
  items: { productId: string; quantity: number }[];
}

export interface ValidateCouponCartResponse {
  success: boolean;
  message: string;
  data?: {
    code: string;
    discountAmount: number;
    couponId: string;
  };
}

export const couponService = {
  /** Authenticated shoppers: preview discount for current cart (matches checkout rules). */
  validateCart(body: ValidateCouponCartBody) {
    return api.post<ValidateCouponCartResponse>("/coupons/validate", body);
  },

  list(filters?: ListCouponsParams) {
    return api.get<CouponListResponse>("/coupons", toQueryParams(filters));
  },

  getById(id: string) {
    return api.get<SingleCouponResponse>(`/coupons/${id}`);
  },

  create(body: CreateCouponBody) {
    return api.post<SingleCouponResponse>("/coupons", body);
  },

  update(id: string, body: UpdateCouponBody) {
    return api.patch<SingleCouponResponse>(`/coupons/${id}`, body);
  },

  delete(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/coupons/${id}`);
  },

  toggle(id: string) {
    return api.patch<SingleCouponResponse>(`/coupons/${id}/toggle`);
  },
};
