import { api } from "./api";

export interface DashboardLowStockVariant {
  id: string;
  sku: string;
  ageRange: string;
  stock: number;
  reorderLevel: number;
  product: { id: string; name: string };
}

export interface DashboardTopProduct {
  productId: string;
  name: string;
  totalSold: number;
}

export interface AdminDashboardData {
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  returns: {
    pending: number;
    approved: number;
  };
  payments: {
    pendingReview: number;
  };
  inventory: {
    lowStock: DashboardLowStockVariant[];
    outOfStock: number;
  };
  customers: {
    total: number;
    newToday: number;
  };
  topProducts: DashboardTopProduct[];
}

export interface AdminDashboardResponse {
  success: boolean;
  message: string;
  data: AdminDashboardData;
}

export const dashboardService = {
  get() {
    return api.get<AdminDashboardResponse>("/dashboard");
  },
};
