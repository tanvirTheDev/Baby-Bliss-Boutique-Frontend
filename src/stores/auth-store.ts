import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/services/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  pendingVerificationEmail: string | null;
  otpType: "registration" | "forgot-password" | null;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  setPendingVerification: (
    email: string,
    type: "registration" | "forgot-password"
  ) => void;
  clearPendingVerification: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      pendingVerificationEmail: null,
      otpType: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => {
        set({ user });
      },

      setPendingVerification: (email, type) => {
        set({ pendingVerificationEmail: email, otpType: type });
      },

      clearPendingVerification: () => {
        set({ pendingVerificationEmail: null, otpType: null });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          pendingVerificationEmail: null,
          otpType: null,
        });
      },
    }),
    { name: "baby-bliss-auth" }
  )
);
