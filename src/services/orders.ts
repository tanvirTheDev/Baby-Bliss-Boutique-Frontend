import { api } from "./api";

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderUser {
  id: string;
  email: string;
  fullName: string;
}

export interface OrderCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  maximumDiscount?: number | null;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  product?: {
    images?: { url: string; isPrimary: boolean; altText?: string | null }[];
  };
}

export interface ShippingSnapshot {
  fullName: string;
  phoneNumber: string;
  division: string;
  district: string;
  upazila: string;
  area?: string;
  street: string;
  zip?: string;
}

export interface Order {
  id: string;
  userId: string;
  shippingAddressId: string;
  shippingSnapshot?: ShippingSnapshot | Record<string, unknown>;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser;
  coupon?: OrderCoupon | null;
  orderItems: OrderItem[];
}

export interface CreateOrderInput {
  shippingAddressId: string;
  items: { productId: string; quantity: number }[];
  couponCode?: string;
  notes?: string;
}

export interface AdminCreateOrderInput extends CreateOrderInput {
  userId: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string | null;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface OrderListResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SingleOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export const orderService = {
  getAll(params?: OrderListParams) {
    const q: Record<string, string> = {};
    if (params?.page) q.page = String(params.page);
    if (params?.limit) q.limit = String(params.limit);
    if (params?.orderStatus) q.orderStatus = params.orderStatus;
    if (params?.paymentStatus) q.paymentStatus = params.paymentStatus;
    return api.get<OrderListResponse>("/orders", q);
  },

  getById(id: string) {
    return api.get<SingleOrderResponse>(`/orders/${id}`);
  },

  create(data: CreateOrderInput) {
    return api.post<CreateOrderResponse>("/orders", data);
  },

  adminCreate(data: AdminCreateOrderInput) {
    return api.post<CreateOrderResponse>("/orders/admin", data);
  },

  update(id: string, data: UpdateOrderInput) {
    return api.patch<SingleOrderResponse>(`/orders/${id}`, data);
  },

  delete(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/orders/${id}`);
  },
};
