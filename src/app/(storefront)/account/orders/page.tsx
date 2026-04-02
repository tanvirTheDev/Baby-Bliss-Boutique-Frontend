"use client";

import Link from "next/link";
import { useMe } from "@/hooks/use-users";
import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatBDT } from "@/lib/currency";

export default function AccountOrdersPage() {
  const { data: me } = useMe();
  const { data, isLoading } = useOrders({ page: 1, limit: 20 });

  const orders = (data?.data ?? []).filter((o) => (me?.id ? o.userId === me.id : true));

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
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Badge variant="secondary" className="uppercase">
                      {o.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatBDT(o.totalAmount)}</p>
                      <p className="text-muted-foreground text-xs">{o.paymentStatus}</p>
                    </div>
                    <Link
                      href={`/dashboard/orders?search=${o.id}`}
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
