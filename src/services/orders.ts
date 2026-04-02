import { api } from "./api";
import type { ShippingAddress } from "./shipping-addresses";

export const orderService = {
  getAll(params?: {
    page?: number;
    limit?: number;
    orderStatus?: string;
    paymentStatus?: string;
  }) {
    const q: Record<string, string> = {};
    if (params?.page) q.page = String(params.page);
    if (params?.limit) q.limit = String(params.limit);
    if (params?.orderStatus) q.orderStatus = params.orderStatus;
    if (params?.paymentStatus) q.paymentStatus = params.paymentStatus;
    return api.get<ListOrdersResponse>("/orders", q);
  },

  getById(id: string) {
    return api.get<GetOrderResponse>(`/orders/${id}`);
  },

  create(data: CreateOrderInput) {
    return api.post<CreateOrderResponse>("/orders", data);
  },

  // backend does not expose patch /orders/:id in routes currently
};

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export type PaymentStatus = "PAID" | "UNPAID";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  product?: { images?: { url: string; isPrimary: boolean }[] };
}

export interface Order {
  id: string;
  userId: string;
  shippingAddressId: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  shippingSnapshot?: Omit<
    ShippingAddress,
    "id" | "isDefault" | "createdAt" | "updatedAt"
  >;
  orderItems: OrderItem[];
}

export interface CreateOrderInput {
  shippingAddressId: string;
  items: { productId: string; quantity: number }[];
  couponCode?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface GetOrderResponse {
  message: string;
  data: Order;
}

export interface ListOrdersResponse {
  message: string;
  data: Order[];
  pagination?: unknown;
}
