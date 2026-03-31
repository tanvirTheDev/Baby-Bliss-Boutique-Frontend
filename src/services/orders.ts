import { api } from "./api";
import type { Order, PaginatedResponse } from "@/types";

export const orderService = {
  getAll(params?: Record<string, string>) {
    return api.get<PaginatedResponse<Order>>("/orders", params);
  },

  getById(id: string) {
    return api.get<Order>(`/orders/${id}`);
  },

  create(data: Partial<Order>) {
    return api.post<Order>("/orders", data);
  },

  updateStatus(id: string, status: string) {
    return api.patch<Order>(`/orders/${id}`, { status });
  },
};
