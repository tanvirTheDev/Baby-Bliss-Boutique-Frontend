import { api } from "./api";

export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatar?: string | null;
  role: "CUSTOMER" | "ADMIN";
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersParams {
  role?: "CUSTOMER" | "ADMIN";
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListUsersResponse {
  success: boolean;
  message: string;
  data: BackendUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface GetMeResponse {
  message: string;
  data: BackendUser;
}

export interface SingleUserResponse {
  success: boolean;
  message: string;
  data: BackendUser;
}

export interface UpdateMeInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
}

export type AdminUpdateUserInput = UpdateMeInput;

export interface UpdateMeResponse {
  message: string;
  data: BackendUser;
}

export const userService = {
  list(params?: ListUsersParams) {
    const q: Record<string, string> = {};
    if (params?.role) q.role = params.role;
    if (params?.isActive !== undefined) q.isActive = String(params.isActive);
    if (params?.search?.trim()) q.search = params.search.trim();
    if (params?.page) q.page = String(params.page);
    if (params?.limit) q.limit = String(params.limit);
    return api.get<ListUsersResponse>("/users", q);
  },

  getById(id: string) {
    return api.get<SingleUserResponse>(`/users/${id}`);
  },

  getMe() {
    return api.get<GetMeResponse>("/users/me");
  },

  updateMe(data: UpdateMeInput) {
    return api.patch<UpdateMeResponse>("/users/me", data);
  },

  updateById(id: string, data: AdminUpdateUserInput) {
    return api.patch<SingleUserResponse>(`/users/${id}`, data);
  },

  setUserActive(userId: string, isActive: boolean) {
    return api.patch<{
      message: string;
      data: { id: string; email: string; isActive: boolean };
    }>(`/users/${userId}/status`, { isActive });
  },
};
