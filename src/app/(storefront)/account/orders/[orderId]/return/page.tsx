"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { variantListKey } from "@/hooks/use-product-variants";
import { useCreateReturn } from "@/hooks/use-returns";
import { useOrder } from "@/hooks/use-orders";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatBDT } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { productVariantService } from "@/services/product-variants";
import type { Order, OrderItem } from "@/services/orders";
import type { ReturnReason, ReturnType } from "@/services/returns";
import { ArrowLeft, Loader2 } from "lucide-react";

type LineState = { selected: boolean; qty: number; exchangeVariantId: string };

const REASON_OPTIONS: { value: ReturnReason; label: string }[] = [
  { value: "WRONG_ITEM", label: "Wrong item" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "NOT_AS_DESCRIBED", label: "Not as described" },
  { value: "CHANGED_MIND", label: "Changed mind" },
  { value: "OTHER", label: "Other" },
];

function ExchangeVariantSelect({
  productId,
  orderItemAgeRange,
  value,
  onChange,
  enabled,
}: {
  productId: string;
  orderItemAgeRange: string | null | undefined;
  value: string;
  onChange: (v: string) => void;
  enabled: boolean;
}) {
  const { data: variants, isLoading } = useQuery({
    queryKey: variantListKey(productId),
    queryFn: async () => {
      const res = await productVariantService.listByProduct(productId);
      return res.data ?? [];
    },
    enabled: enabled && !!productId,
  });

  const choices = useMemo(() => {
    if (!variants?.length) return [];
    return variants.filter(
      (v) => v.isActive && v.stock > 0 && v.ageRange !== (orderItemAgeRange ?? "")
    );
  }, [variants, orderItemAgeRange]);

  if (!enabled) return null;

  return (
    <div className="mt-2 space-y-1">
      <Label className="text-xs">Exchange for size / variant</Label>
      {isLoading ? (
        <p className="text-muted-foreground text-xs">Loading variants…</p>
      ) : choices.length === 0 ? (
        <p className="text-destructive text-xs">
          No other in-stock variants available for this product.
        </p>
      ) : (
        <Select value={value || undefined} onValueChange={(v) => onChange(v ?? "")}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Choose variant" />
          </SelectTrigger>
          <SelectContent>
            {choices.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.ageRange} · {v.sku} · stock {v.stock}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

function OrderLineEditor({
  item,
  returnType,
  line,
  onUpdate,
}: {
  item: OrderItem;
  returnType: ReturnType;
  line: LineState;
  onUpdate: (patch: Partial<LineState>) => void;
}) {
  const exchangeEnabled = returnType === "EXCHANGE" && line.selected && !!item.productId;

  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-start gap-3">
        <Checkbox
          id={`pick-${item.id}`}
          checked={line.selected}
          onCheckedChange={(c) => onUpdate({ selected: c === true })}
          disabled={returnType === "EXCHANGE" && !item.productId}
        />
        <div className="min-w-0 flex-1">
          <Label htmlFor={`pick-${item.id}`} className="cursor-pointer font-medium">
            {item.productName}
          </Label>
          <p className="text-muted-foreground text-xs">
            Ordered qty {item.quantity}
            {item.ageRange ? ` · ${item.ageRange}` : ""}
            {item.sku ? ` · ${item.sku}` : ""}
          </p>
          {returnType === "EXCHANGE" && !item.productId ? (
            <p className="text-destructive mt-1 text-xs">
              Exchanges need a linked product; contact support for this line.
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor={`qty-${item.id}`}
            className="text-muted-foreground text-xs whitespace-nowrap"
          >
            Qty
          </Label>
          <Input
            id={`qty-${item.id}`}
            type="number"
            min={1}
            max={item.quantity}
            className="h-8 w-16"
            disabled={!line.selected}
            value={line.qty}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              if (Number.isNaN(n)) return;
              const qty = Math.min(Math.max(1, n), item.quantity);
              onUpdate({ qty });
            }}
          />
        </div>
      </div>
      <ExchangeVariantSelect
        productId={item.productId ?? ""}
        orderItemAgeRange={item.ageRange}
        value={line.exchangeVariantId}
        onChange={(exchangeVariantId) => onUpdate({ exchangeVariantId })}
        enabled={exchangeEnabled}
      />
    </div>
  );
}

function OrderReturnFormBody({ order, orderId }: { order: Order; orderId: string }) {
  const router = useRouter();
  const createReturn = useCreateReturn();

  const [returnType, setReturnType] = useState<ReturnType>("RETURN");
  const [reason, setReason] = useState<ReturnReason>("CHANGED_MIND");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Record<string, LineState>>(() =>
    Object.fromEntries(
      order.orderItems.map((oi) => [
        oi.id,
        { selected: false, qty: 1, exchangeVariantId: "" },
      ])
    )
  );

  const canSubmit = useMemo(() => {
    const picked = order.orderItems.filter((oi) => lines[oi.id]?.selected);
    if (picked.length === 0) return false;
    if (returnType === "EXCHANGE") {
      return picked.every(
        (oi) =>
          oi.productId &&
          lines[oi.id]?.exchangeVariantId &&
          lines[oi.id]!.exchangeVariantId.length > 0
      );
    }
    return true;
  }, [order.orderItems, lines, returnType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const items = order.orderItems
      .filter((oi) => lines[oi.id]?.selected)
      .map((oi) => {
        const row = lines[oi.id]!;
        return {
          orderItemId: oi.id,
          quantity: row.qty,
          ...(returnType === "EXCHANGE"
            ? { exchangeVariantId: row.exchangeVariantId }
            : {}),
        };
      });

    try {
      const out = await createReturn.mutateAsync({
        orderId: order.id,
        returnType,
        reason,
        note: note.trim() || undefined,
        items,
      });
      router.push(`/account/returns/${out.data.id}`);
    } catch {
      /* toast from hook */
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/account/orders/${orderId}`}
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          Order details
        </Link>
        <h2 className="font-heading text-2xl font-bold">Return or exchange</h2>
        <p className="text-muted-foreground text-sm">
          Choose items and a reason. For an exchange, pick a different size for each
          selected line. Order total {formatBDT(order.totalAmount)}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={returnType}
                onValueChange={(v) => setReturnType((v as ReturnType) ?? "RETURN")}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RETURN">Return for refund</SelectItem>
                  <SelectItem value="EXCHANGE">Exchange for another size</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason((v as ReturnReason) ?? "OTHER")}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything else we should know"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.orderItems.map((oi) => (
              <OrderLineEditor
                key={oi.id}
                item={oi}
                returnType={returnType}
                line={lines[oi.id] ?? { selected: false, qty: 1, exchangeVariantId: "" }}
                onUpdate={(patch) =>
                  setLines((prev) => {
                    const cur = prev[oi.id] ?? {
                      selected: false,
                      qty: 1,
                      exchangeVariantId: "",
                    };
                    return { ...prev, [oi.id]: { ...cur, ...patch } };
                  })
                }
              />
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!canSubmit || createReturn.isPending}>
            {createReturn.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit request"
            )}
          </Button>
          <Link
            href={`/account/orders/${orderId}`}
            className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AccountOrderReturnPage() {
  const params = useParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : "";
  const { data: res, isLoading, isError } = useOrder(orderId);

  const order = res?.data;

  const existingReturn = order?.returns?.[0];

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

  if (existingReturn) {
    return (
      <div className="space-y-4">
        <Link
          href={`/account/orders/${orderId}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          Order details
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Request already submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This order already has a return or exchange on file.
            </p>
            <Link
              href={`/account/returns/${existingReturn.id}`}
              className={buttonVariants()}
            >
              View your request
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (order.status !== "DELIVERED") {
    return (
      <div className="space-y-4">
        <Link
          href={`/account/orders/${orderId}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          Order details
        </Link>
        <p className="text-muted-foreground text-sm">
          Returns and exchanges are only available after your order is marked delivered.
        </p>
      </div>
    );
  }

  return <OrderReturnFormBody key={order.id} order={order} orderId={orderId} />;
}
