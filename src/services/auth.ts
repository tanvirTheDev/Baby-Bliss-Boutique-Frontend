import { api } from "./api";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: "CUSTOMER" | "ADMIN";
  isEmailVerified: boolean;
  createdAt: string;
}

interface RegisterResponse {
  message: string;
  data: AuthUser;
}

interface LoginResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface MessageResponse {
  message: string;
}

interface RefreshResponse {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export const authService = {
  register(data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    password: string;
  }) {
    return api.post<RegisterResponse>("/auth/register", data);
  },

  login(data: { email: string; password: string }) {
    return api.post<LoginResponse>("/auth/login", data);
  },

  verifyRegistrationOtp(data: { email: string; otp: string }) {
    return api.post<MessageResponse>("/auth/verify-otp", data);
  },

  forgotPassword(data: { email: string }) {
    return api.post<MessageResponse>("/auth/forgot-password", data);
  },

  verifyForgotPasswordOtp(data: { email: string; otp: string }) {
    return api.post<MessageResponse>("/auth/verify-forgot-otp", data);
  },

  refreshToken(refreshToken: string) {
    return api.post<RefreshResponse>("/auth/refresh", { refreshToken });
  },

  logout() {
    return api.post<MessageResponse>("/auth/logout");
  },
};
