import { api } from "./api";

export type ReturnStatus = "PENDING" | "RECEIVED" | "APPROVED" | "REJECTED" | "COMPLETED";

export type ReturnType = "RETURN" | "EXCHANGE";

export type ReturnReason =
  | "WRONG_ITEM"
  | "DAMAGED"
  | "NOT_AS_DESCRIBED"
  | "CHANGED_MIND"
  | "OTHER";

export interface ReturnListItemUser {
  id: string;
  fullName: string | null;
  email: string;
}

export interface ReturnOrderItemSnapshot {
  productName: string;
  sku: string;
  ageRange: string;
  unitPrice: number;
  quantity: number;
}

export interface ReturnVariantRef {
  id: string;
  sku: string;
  ageRange: string;
}

export interface OrderReturnItem {
  id: string;
  orderItemId: string;
  quantity: number;
  variantId: string | null;
  exchangeVariantId: string | null;
  isDamaged?: boolean | null;
  refundAmount?: number | null;
  orderItem: ReturnOrderItemSnapshot;
  variant: ReturnVariantRef | null;
  exchangeVariant: ReturnVariantRef | null;
}

export interface OrderReturn {
  id: string;
  orderId: string;
  userId: string;
  returnType: ReturnType;
  status: ReturnStatus;
  reason: ReturnReason;
  note?: string | null;
  adminNote?: string | null;
  totalRefundAmount?: number | null;
  deliveryRefunded?: boolean | null;
  refundMethod?: string | null;
  refundTransactionId?: string | null;
  refundPhoneNumber?: string | null;
  refundIssuedAt?: string | null;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  returnItems: OrderReturnItem[];
  user?: ReturnListItemUser;
  order?: {
    id: string;
    totalAmount: number;
    deliveryCharge: number;
    paymentStatus: string;
    status: string;
  };
}

export interface ListReturnsParams {
  page?: number;
  limit?: number;
  status?: ReturnStatus;
  returnType?: ReturnType;
}

export interface ReturnsListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ListReturnsResponse {
  message: string;
  data: OrderReturn[];
  meta: ReturnsListMeta;
}

export interface SingleReturnResponse {
  success?: boolean;
  message: string;
  data: OrderReturn;
}

export interface ApproveReturnPayload {
  adminNote?: string;
  deliveryRefunded?: boolean;
  refundMethod: string;
  items: {
    returnItemId: string;
    isDamaged: boolean;
    refundAmount?: number;
  }[];
}

export interface RejectReturnPayload {
  adminNote: string;
}

export interface CompleteReturnPayload {
  adminNote?: string;
  refundTransactionId?: string;
  refundPhoneNumber?: string;
  refundIssuedAt?: string;
}

export interface CreateReturnItemInput {
  orderItemId: string;
  quantity: number;
  exchangeVariantId?: string;
}

export interface CreateReturnPayload {
  orderId: string;
  returnType: ReturnType;
  reason: ReturnReason;
  note?: string;
  items: CreateReturnItemInput[];
}

export interface CreateReturnResponse {
  success: boolean;
  message: string;
  data: OrderReturn;
}

export const returnsService = {
  list(params?: ListReturnsParams) {
    const q: Record<string, string> = {};
    if (params?.page) q.page = String(params.page);
    if (params?.limit) q.limit = String(params.limit);
    if (params?.status) q.status = params.status;
    if (params?.returnType) q.returnType = params.returnType;
    return api.get<ListReturnsResponse>("/returns", q);
  },

  myList(params?: ListReturnsParams) {
    const q: Record<string, string> = {};
    if (params?.page) q.page = String(params.page);
    if (params?.limit) q.limit = String(params.limit);
    if (params?.status) q.status = params.status;
    if (params?.returnType) q.returnType = params.returnType;
    return api.get<ListReturnsResponse>("/returns/my", q);
  },

  create(body: CreateReturnPayload) {
    return api.post<CreateReturnResponse>("/returns", body);
  },

  getById(id: string) {
    return api.get<SingleReturnResponse>(`/returns/${id}`);
  },

  listByUserId(userId: string, params?: ListReturnsParams) {
    const q: Record<string, string> = {};
    if (params?.page) q.page = String(params.page);
    if (params?.limit) q.limit = String(params.limit);
    if (params?.status) q.status = params.status;
    if (params?.returnType) q.returnType = params.returnType;
    return api.get<ListReturnsResponse>(`/returns/users/${userId}`, q);
  },

  receive(id: string, body?: { adminNote?: string }) {
    return api.patch<SingleReturnResponse>(`/returns/${id}/receive`, body ?? {});
  },

  approve(id: string, body: ApproveReturnPayload) {
    return api.patch<SingleReturnResponse>(`/returns/${id}/approve`, body);
  },

  reject(id: string, body: RejectReturnPayload) {
    return api.patch<SingleReturnResponse>(`/returns/${id}/reject`, body);
  },

  complete(id: string, body: CompleteReturnPayload) {
    return api.patch<SingleReturnResponse>(`/returns/${id}/complete`, body);
  },
};
