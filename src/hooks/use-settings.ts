"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService, type UpdateSettingsInput } from "@/services/settings";
import { toast } from "sonner";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await settingsService.get();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => settingsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to save settings");
    },
  });
}

export function useUploadSettingsImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: {
      logo?: File | null;
      logoDark?: File | null;
      favicon?: File | null;
      ogImage?: File | null;
    }) => settingsService.uploadImages(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Images uploaded");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to upload images");
    },
  });
}
