"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [transactionId, setTransactionId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const amount = useMemo(() => (order ? order.totalAmount : 0), [order]);

  const paymentMethod = order?.payment?.paymentMethod as PaymentMethod | undefined;
  const isCOD =
    paymentMethod === "COD" || (!paymentMethod && order?.paymentStatus === "UNPAID");

  const submit = async () => {
    if (!order || !paymentMethod) return;
    if (!transactionId.trim()) return toast.error("Transaction ID is required");
    if (!phoneNumber.trim()) return toast.error("Phone number is required");

    try {
      await createManualPayment.mutateAsync({
        orderId: order.id,
        amount,
        paymentMethod,
        transactionId: transactionId.trim(),
        phoneNumber: phoneNumber.trim(),
        image: file ?? undefined,
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
          Order <span className="font-mono">{order.id}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>
              {isCOD ? "Cash on Delivery" : `Pay via ${paymentMethod ?? "—"}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isCOD ? (
              /* ── COD: no payment proof needed ────────────────────────── */
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <PackageCheck className="h-12 w-12 text-emerald-500" />
                <div>
                  <p className="font-semibold">Pay when your order arrives</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    No payment proof needed. Our delivery agent will collect payment upon
                    delivery.
                  </p>
                </div>
                <Button variant="outline" onClick={() => router.push("/account/orders")}>
                  View my orders
                </Button>
              </div>
            ) : (
              /* ── Online payment proof ─────────────────────────────────── */
              <>
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
                  <Label className="text-xs font-medium">
                    Payment screenshot{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
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
                  {createManualPayment.isPending
                    ? "Submitting..."
                    : "Submit payment proof"}
                </Button>
              </>
            )}
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
            {paymentMethod && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{paymentMethod}</span>
              </div>
            )}
            {!isCOD && (
              <p className="text-muted-foreground pt-2 text-xs">
                After you submit payment proof, an admin will review and update your
                payment status.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
