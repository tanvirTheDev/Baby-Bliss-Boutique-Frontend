"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useCancelOrder, useMyOrders } from "@/hooks/use-orders";
import { formatBDT } from "@/lib/currency";
import { Loader2, Truck } from "lucide-react";

const STEADFAST_TRACKING_URL = "https://steadfast.com.bd/track/";

export default function AccountOrdersPage() {
  const { data, isLoading } = useMyOrders({ page: 1, limit: 20 });
  const cancelMutation = useCancelOrder();

  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const orders = data?.data ?? [];

  const openCancel = (id: string) => {
    setCancelTargetId(id);
    setCancelReason("");
  };

  const handleCancel = async () => {
    if (!cancelTargetId || !cancelReason.trim()) return;
    await cancelMutation.mutateAsync(
      { id: cancelTargetId, data: { cancelReason: cancelReason.trim() } },
      { onSuccess: () => setCancelTargetId(null) }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">My Orders</h2>
        <p className="text-muted-foreground text-sm">
          Track your recent purchases and delivery status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="text-brand-gold h-7 w-7 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Order <span className="font-mono">{o.id.slice(0, 10)}</span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Items:{" "}
                      <span className="font-medium">{o.orderItems?.length ?? 0}</span>
                    </p>
                    {/* Steadfast tracking chip */}
                    {(o.status === "SHIPPED" || o.status === "DELIVERED") &&
                    o.trackingNumber ? (
                      <a
                        href={`${STEADFAST_TRACKING_URL}${o.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
                      >
                        <Truck className="h-3 w-3" />
                        Track: <span className="font-mono">{o.trackingNumber}</span>
                      </a>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    <Badge variant="secondary" className="uppercase">
                      {o.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatBDT(o.totalAmount)}</p>
                      <p className="text-muted-foreground text-xs">{o.paymentStatus}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/account/orders/${o.id}`}
                        className="text-primary text-xs font-medium hover:underline"
                      >
                        View
                      </Link>
                      {o.status === "DELIVERED" ? (
                        <Link
                          href={`/account/orders/${o.id}/return`}
                          className="text-muted-foreground text-xs font-medium hover:underline"
                        >
                          Return / exchange
                        </Link>
                      ) : null}
                      {o.status === "PENDING" ? (
                        <button
                          className="text-destructive text-xs font-medium hover:underline"
                          onClick={() => openCancel(o.id)}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Cancel dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={!!cancelTargetId}
        onOpenChange={(o) => {
          if (!o) setCancelTargetId(null);
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
            <Button variant="outline" onClick={() => setCancelTargetId(null)}>
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
