import { env } from "@/config/env";

export type PaymentMethod = "BKASH" | "NAGAD" | "ROCKET";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  phoneNumber: string;
  paymentScreenshot?: string | null;
  paymentStatus: PaymentStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: { id: string; totalAmount: number };
  user?: { id: string; fullName: string; email: string };
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

export interface CreateManualPaymentInput {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  phoneNumber: string;
  image: File;
}

export type CreateManualPaymentResponse = {
  success: boolean;
  message: string;
  data: Payment | null;
};

export const paymentService = {
  async createManual(input: CreateManualPaymentInput) {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append("orderId", input.orderId);
    formData.append("amount", String(input.amount));
    formData.append("paymentMethod", input.paymentMethod);
    formData.append("transactionId", input.transactionId);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("image", input.image);

    const res = await fetch(`${env.API_BASE_URL}/payments/manual`, {
      method: "POST",
      headers,
      body: formData,
    });

    return parseJsonResponse<CreateManualPaymentResponse>(res);
  },
};
