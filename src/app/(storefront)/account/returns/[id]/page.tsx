"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useReturnDetail } from "@/hooks/use-returns";
import { formatBDT } from "@/lib/currency";
import { Loader2 } from "lucide-react";
import type { ReturnReason, ReturnStatus } from "@/services/returns";

const REASON_LABEL: Record<ReturnReason, string> = {
  WRONG_ITEM: "Wrong item",
  DAMAGED: "Damaged",
  NOT_AS_DESCRIBED: "Not as described",
  CHANGED_MIND: "Changed mind",
  OTHER: "Other",
};

const statusVariant: Partial<
  Record<ReturnStatus, "default" | "secondary" | "destructive" | "outline">
> = {
  PENDING: "secondary",
  RECEIVED: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
  COMPLETED: "outline",
};

export default function AccountReturnDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { data: r, isLoading, isError } = useReturnDetail(id || null);

  if (!id) {
    return <p className="text-muted-foreground text-sm">Invalid return link.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !r) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">We could not load this return.</p>
        <Link href="/account/returns" className="text-primary text-sm underline">
          Back to returns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/account/returns"
            className="text-muted-foreground hover:text-foreground mb-2 inline-block text-xs underline"
          >
            ← All returns
          </Link>
          <h2 className="font-heading text-2xl font-bold">
            {r.returnType === "EXCHANGE" ? "Exchange" : "Return"} request
          </h2>
          <p className="text-muted-foreground font-mono text-xs">{r.id}</p>
        </div>
        <Badge variant={statusVariant[r.status] ?? "secondary"} className="uppercase">
          {r.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Reason: </span>
            {REASON_LABEL[r.reason] ?? r.reason}
          </p>
          {r.note ? (
            <p>
              <span className="text-muted-foreground">Your note: </span>
              {r.note}
            </p>
          ) : null}
          {r.adminNote ? (
            <p>
              <span className="text-muted-foreground">Message from the store: </span>
              {r.adminNote}
            </p>
          ) : null}
          {typeof r.totalRefundAmount === "number" ? (
            <p>
              <span className="text-muted-foreground">Refund total: </span>
              {formatBDT(r.totalRefundAmount)}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {r.returnItems.map((item) => (
            <div key={item.id}>
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-medium">{item.orderItem.productName}</p>
                  <p className="text-muted-foreground text-xs">
                    SKU {item.orderItem.sku} · {item.orderItem.ageRange} · Qty{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="text-sm">
                  {formatBDT(item.orderItem.unitPrice * item.quantity)}
                </p>
              </div>
              {r.returnType === "EXCHANGE" && item.exchangeVariant ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  Exchange to: {item.exchangeVariant.ageRange} ({item.exchangeVariant.sku}
                  )
                </p>
              ) : null}
              <Separator className="mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
