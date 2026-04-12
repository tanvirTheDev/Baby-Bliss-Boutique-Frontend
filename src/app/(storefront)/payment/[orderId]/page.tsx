"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useOrder } from "@/hooks/use-orders";
import { useCreateManualPayment } from "@/hooks/use-payments";
import { formatBDT } from "@/lib/currency";
import type { PaymentMethod } from "@/services/payments";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const { data: orderRes, isLoading } = useOrder(orderId);
  const order = orderRes?.data;

  const createManualPayment = useCreateManualPayment();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BKASH");
  const [transactionId, setTransactionId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const amount = useMemo(() => (order ? order.totalAmount : 0), [order]);

  const submit = async () => {
    if (!order) return;
    if (!transactionId.trim()) return toast.error("Transaction ID is required");
    if (!phoneNumber.trim()) return toast.error("Phone number is required");
    if (!file) return toast.error("Payment screenshot is required");

    try {
      await createManualPayment.mutateAsync({
        orderId: order.id,
        amount,
        paymentMethod,
        transactionId: transactionId.trim(),
        phoneNumber: phoneNumber.trim(),
        image: file,
      });

      toast.success("Payment submitted for review");
      router.push("/account/orders");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message ?? "Failed to submit payment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link href="/account/orders">
          <Button variant="outline">Go to orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/account/orders"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Payment</h1>
        <p className="text-muted-foreground text-sm">
          Submit your payment proof for order{" "}
          <span className="font-mono">{order.id}</span>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Manual payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Payment method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="space-y-2"
              >
                {(["BKASH", "NAGAD", "ROCKET"] as const).map((m) => (
                  <label
                    key={m}
                    className="hover:bg-muted/50 has-data-[state=checked]:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <RadioGroupItem value={m} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m}</p>
                      <p className="text-muted-foreground text-xs">
                        Enter transaction ID and upload screenshot
                      </p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Transaction ID</Label>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 9A7B3C..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Payment phone</Label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Payment screenshot</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <Button
              className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white"
              onClick={submit}
              disabled={createManualPayment.isPending}
            >
              {createManualPayment.isPending ? "Submitting..." : "Submit payment proof"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order total</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total amount</span>
              <span className="font-semibold">{formatBDT(amount)}</span>
            </div>
            <div className="text-muted-foreground pt-2 text-xs">
              After you submit payment proof, an admin will review and update your payment
              status.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
