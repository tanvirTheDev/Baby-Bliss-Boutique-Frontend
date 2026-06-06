import { api } from "./api";
import { env } from "@/config/env";

export interface Settings {
  id: string;
  // Branding
  storeName: string;
  tagline: string | null;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Business
  businessEmail: string | null;
  supportEmail: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  Upazila: string | null;
  district: string | null;
  division: string | null;
  postalCode: string | null;
  country: string;
  tradeLicenseNo: string | null;
  tinNo: string | null;
  binNo: string | null;
  // Social
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  whatsappGroupUrl: string | null;
  // Commerce
  currencyCode: string;
  currencySymbol: string;
  vatRate: number;
  vatInclusive: boolean;
  // Shipping
  insideDhakaFee: number;
  outsideDhakaFee: number;
  freeShippingThreshold: number | null;
  lowStockThreshold: number;
  // Payment
  codEnabled: boolean;
  bkashEnabled: boolean;
  nagadEnabled: boolean;
  rocketEnabled: boolean;
  sslCommerzEnabled: boolean;
  // Courier
  steadfastEnabled: boolean;
  pathaoEnabled: boolean;
  redxEnabled: boolean;
  // Localization
  timezone: string;
  dateFormat: string;
  locale: string;
  // SEO
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImageUrl: string | null;
  googleAnalyticsId: string | null;
  gtmId: string | null;
  facebookPixelId: string | null;
  robotsIndex: boolean;
  // System
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  allowGuestCheckout: boolean;
  requirePhoneVerify: boolean;
  requireEmailVerify: boolean;
  updatedAt: string;
}

export type UpdateSettingsInput = Partial<
  Omit<
    Settings,
    "id" | "updatedAt" | "logoUrl" | "logoDarkUrl" | "faviconUrl" | "ogImageUrl"
  >
>;

interface SettingsResponse {
  success: boolean;
  message: string;
  data: Settings;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("baby-bliss-auth");
    if (!stored) return null;
    return JSON.parse(stored)?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

export const settingsService = {
  get() {
    return api.get<SettingsResponse>("/site-settings");
  },

  update(data: UpdateSettingsInput) {
    return api.patch<SettingsResponse>("/site-settings", data);
  },

  async uploadImages(files: {
    logo?: File | null;
    logoDark?: File | null;
    favicon?: File | null;
    ogImage?: File | null;
  }): Promise<SettingsResponse> {
    const formData = new FormData();
    if (files.logo) formData.append("logo", files.logo);
    if (files.logoDark) formData.append("logoDark", files.logoDark);
    if (files.favicon) formData.append("favicon", files.favicon);
    if (files.ogImage) formData.append("ogImage", files.ogImage);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${env.API_BASE_URL}/site-settings`, {
      method: "PATCH",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Upload failed" }));
      throw err;
    }
    return res.json();
  },
};
