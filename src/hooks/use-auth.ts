"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiError } from "@/types";

type AccessTokenPayload = {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
  email: string;
  isEmailVerified: boolean;
  iat: number;
  exp: number;
};

function decodeJwtPayload(token: string): AccessTokenPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(normalized));
    return json as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function useRegister() {
  const router = useRouter();
  const { setPendingVerification } = useAuthStore();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data, variables) => {
      setPendingVerification(variables.email, "registration");
      toast.success(data.message);
      router.push("/verify-otp");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Registration failed");
    },
  });
}
export function useLogin() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setTokens(data.data.accessToken, data.data.refreshToken);
      const payload = decodeJwtPayload(data.data.accessToken);
      if (payload) {
        setUser({
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          isEmailVerified: payload.isEmailVerified,
          fullName: payload.email.split("@")[0],
        });
      }
      toast.success("Login successful!");
      router.push(payload?.role === "ADMIN" ? "/dashboard" : "/");
    },
    onError: (error: ApiError & { error?: string }) => {
      if (error.error === "Your email is not verified. Please verify your email first.") {
        toast.error("Please verify your email first.");
        return;
      }
      toast.error(error.message ?? "Login failed");
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({
      email,
      otp,
      type,
    }: {
      email: string;
      otp: string;
      type: "registration" | "forgot-password";
    }) => {
      if (type === "registration") {
        return authService.verifyRegistrationOtp({ email, otp });
      }
      return authService.verifyForgotPasswordOtp({ email, otp });
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: ({
      email,
      type,
    }: {
      email: string;
      type: "registration" | "forgot-password";
    }) => {
      if (type === "registration") {
        return authService
          .register({
            fullName: "",
            email,
            password: "",
          })
          .catch(() => {
            return { message: "OTP resent" } as { message: string; data: never };
          });
      }
      return authService.forgotPassword({ email });
    },
  });
}

export function useForgotPassword() {
  const router = useRouter();
  const { setPendingVerification } = useAuthStore();

  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (data, variables) => {
      setPendingVerification(variables.email, "forgot-password");
      toast.success(data.message);
      router.push("/verify-otp");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to send reset link");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: () => {
      logout();
      router.push("/login");
    },
  });
}
