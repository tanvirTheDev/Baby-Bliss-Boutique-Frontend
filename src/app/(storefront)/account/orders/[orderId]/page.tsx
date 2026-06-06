"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCancelOrder, useOrder } from "@/hooks/use-orders";
import { formatBDT } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Package, Truck } from "lucide-react";
import Image from "next/image";

const STEADFAST_TRACKING_URL = "https://steadfast.com.bd/track/";

export default function AccountOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";
  const { data: res, isLoading, isError } = useOrder(orderId);

  const cancelMutation = useCancelOrder();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const order = res?.data;

  const handleCancel = async () => {
    if (!orderId || !cancelReason.trim()) return;
    await cancelMutation.mutateAsync(
      { id: orderId, data: { cancelReason: cancelReason.trim() } },
      { onSuccess: () => setShowCancelDialog(false) }
    );
  };

  if (!orderId) {
    return <p className="text-muted-foreground text-sm">Invalid order.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">We could not load this order.</p>
        <Link
          href="/account/orders"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Back to orders
        </Link>
      </div>
    );
  }

  const existingReturn = order.returns?.[0];
  const canStartReturn = order.status === "DELIVERED" && !existingReturn;
  const canCancel = order.status === "PENDING";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/orders"
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          My orders
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold">Order details</h2>
            <p className="text-muted-foreground font-mono text-xs">{order.id}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="uppercase">
              {order.status}
            </Badge>
            <Badge variant="outline" className="uppercase">
              {order.paymentStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Steadfast tracking banner ─────────────────────────────────────── */}
      {order.status === "SHIPPED" && order.trackingNumber ? (
        <Card className="border-violet-200 bg-violet-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 shrink-0 text-violet-600" />
              <div>
                <p className="text-sm font-semibold text-violet-900">
                  Your order is on the way!
                </p>
                <p className="text-xs text-violet-700">
                  Tracking number:{" "}
                  <span className="font-mono font-medium">{order.trackingNumber}</span>
                </p>
              </div>
            </div>
            <a
              href={`${STEADFAST_TRACKING_URL}${order.trackingNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "shrink-0 border-violet-300 text-violet-700 hover:bg-violet-100"
              )}
            >
              Track on Steadfast
            </a>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Delivered tracking ref ────────────────────────────────────────── */}
      {order.status === "DELIVERED" && order.trackingNumber ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex flex-wrap items-center gap-3 pt-5">
            <Package className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Delivered</p>
              <p className="text-xs text-emerald-700">
                Steadfast tracking:{" "}
                <a
                  href={`${STEADFAST_TRACKING_URL}${order.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-medium underline underline-offset-2"
                >
                  {order.trackingNumber}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Return notice ─────────────────────────────────────────────────── */}
      {existingReturn ? (
        <Card className="border-brand-gold/30 bg-brand-gold/5">
          <CardContent className="pt-6 text-sm">
            <p className="font-medium">You already have a request for this order.</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Status: <span className="uppercase">{existingReturn.status}</span> ·{" "}
              {existingReturn.returnType === "EXCHANGE" ? "Exchange" : "Return"}
            </p>
            <Link
              href={`/account/returns/${existingReturn.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3 inline-flex"
              )}
            >
              View request
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {canStartReturn ? (
          <Link href={`/account/orders/${order.id}/return`} className={buttonVariants()}>
            Request return or exchange
          </Link>
        ) : null}
        {canCancel ? (
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
            onClick={() => {
              setCancelReason("");
              setShowCancelDialog(true);
            }}
          >
            Cancel order
          </Button>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.orderItems.map((item) => {
            const img = item.product?.images?.[0]?.url;
            return (
              <div key={item.id} className="flex gap-3">
                <div className="bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                  {img ? (
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="leading-tight font-medium">{item.productName}</p>
                  <p className="text-muted-foreground text-xs">
                    Qty {item.quantity}
                    {item.ageRange ? ` · ${item.ageRange}` : ""}
                    {item.sku ? ` · ${item.sku}` : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatBDT(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatBDT(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>{formatBDT(order.discountAmount)}</span>
          </div>
          {typeof order.deliveryCharge === "number" ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatBDT(order.deliveryCharge)}</span>
            </div>
          ) : null}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatBDT(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Cancel dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={showCancelDialog}
        onOpenChange={(o) => {
          if (!o) setShowCancelDialog(false);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel order</DialogTitle>
            <DialogDescription>
              Tell us why you want to cancel. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label className="text-xs uppercase">Reason</Label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Changed my mind, ordered by mistake…"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep order
            </Button>
            <Button
              variant="destructive"
              disabled={!cancelReason.trim() || cancelMutation.isPending}
              onClick={() => void handleCancel()}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
