"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { paymentService, type CreateManualPaymentInput } from "@/services/payments";

export function useCreateManualPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateManualPaymentInput) => paymentService.createManual(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment submitted");
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? "Failed to submit payment");
    },
  });
}
