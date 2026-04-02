"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService, type ListUsersParams, type UpdateMeInput } from "@/services/users";

export function useMe() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const res = await userService.getMe();
      return res.data;
    },
  });
}

export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.list(params),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMeInput) => userService.updateMe(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", "me"] });
      toast.success("Profile updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update profile");
    },
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: string; isActive: boolean }) =>
      userService.setUserActive(p.userId, p.isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update user status");
    },
  });
}
