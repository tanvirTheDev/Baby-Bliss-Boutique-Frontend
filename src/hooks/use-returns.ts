"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  returnsService,
  type ApproveReturnPayload,
  type CompleteReturnPayload,
  type CreateReturnPayload,
  type ListReturnsParams,
  type RejectReturnPayload,
} from "@/services/returns";

export function useReturnsList(params?: ListReturnsParams) {
  return useQuery({
    queryKey: ["returns", "admin", params],
    queryFn: async () => {
      const res = await returnsService.list(params);
      return { data: res.data, meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useReturnDetail(id: string | null) {
  return useQuery({
    queryKey: ["returns", id],
    queryFn: async () => {
      const res = await returnsService.getById(id!);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useMyReturns(params?: ListReturnsParams) {
  return useQuery({
    queryKey: ["returns", "my", params],
    queryFn: async () => {
      const res = await returnsService.myList(params);
      return { data: res.data, meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReturnPayload) => returnsService.create(body),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ["returns", "my"] });
      qc.invalidateQueries({ queryKey: ["returns"] });
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["orders", "my"] });
      toast.success(res.message);
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Could not submit your request");
    },
  });
}

export function useReceiveReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; adminNote?: string }) =>
      returnsService.receive(p.id, p.adminNote ? { adminNote: p.adminNote } : {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["returns"] });
      toast.success("Return marked as received");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to update return");
    },
  });
}

export function useApproveReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; body: ApproveReturnPayload }) =>
      returnsService.approve(p.id, p.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["returns"] });
      toast.success("Return approved");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to approve return");
    },
  });
}

export function useRejectReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; body: RejectReturnPayload }) =>
      returnsService.reject(p.id, p.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["returns"] });
      toast.success("Return rejected");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to reject return");
    },
  });
}

export function useCompleteReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; body: CompleteReturnPayload }) =>
      returnsService.complete(p.id, p.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["returns"] });
      toast.success("Return completed");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to complete return");
    },
  });
}
