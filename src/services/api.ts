import { env } from "@/config/env";
import type { ApiError } from "@/types";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: "An unexpected error occurred",
        statusCode: response.status,
      }));

      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("baby-bliss-auth");
        window.location.href = "/login";
        throw error;
      }

      throw error;
    }

    if (response.status === 204) return undefined as T;

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, string> | URLSearchParams) {
    if (!params) return this.request<T>(endpoint);
    const qs =
      params instanceof URLSearchParams
        ? params.toString()
        : new URLSearchParams(params).toString();
    return this.request<T>(`${endpoint}?${qs}`);
  }

  async post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(env.API_BASE_URL);
