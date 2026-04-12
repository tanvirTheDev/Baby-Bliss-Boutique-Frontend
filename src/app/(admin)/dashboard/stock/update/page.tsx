"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts, useProduct } from "@/hooks/use-products";
import {
  useAdjustVariantStock,
  useStockSummary,
  useVariantsByProduct,
} from "@/hooks/use-product-variants";
import { totalVariantStock } from "@/services/products";
import { AGE_RANGES } from "@/config/constants";
import { appendStockAuditEntries } from "@/lib/stock-audit-log";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ADJUST_REASONS = [
  "New purchase",
  "Damage / loss",
  "Return to stock",
  "Cycle count correction",
  "Other",
] as const;

function ageLabel(ageRange: string) {
  return (
    AGE_RANGES.find((a) => a.value === ageRange)?.label ?? ageRange.replace(/_/g, " ")
  );
}

function statusBadge(status: string | undefined) {
  switch (status) {
    case "ADEQUATE":
      return (
        <Badge className="bg-sky-100 text-sky-900 hover:bg-sky-100">Adequate stock</Badge>
      );
    case "LOW":
      return (
        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
          Low stock
        </Badge>
      );
    case "OUT_OF_STOCK":
      return <Badge variant="destructive">Out of stock</Badge>;
    default:
      return <Badge variant="secondary">{status?.replace(/_/g, " ") ?? "Unknown"}</Badge>;
  }
}

function stockTone(stock: number, reorder: number) {
  if (stock <= 0) return "text-red-600 font-semibold";
  if (stock <= reorder) return "text-amber-600 font-semibold";
  return "text-emerald-700 font-semibold";
}

function StockUpdatePageContent({ urlProductId }: { urlProductId: string }) {
  const [manualProductId, setManualProductId] = useState<string | null>(null);
  const productId = manualProductId ?? urlProductId;
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState<string>(ADJUST_REASONS[0]);
  const [supplier, setSupplier] = useState("");
  const [invoice, setInvoice] = useState("");
  const [notes, setNotes] = useState("");
  const [adj, setAdj] = useState<Record<string, { add: number; remove: number }>>({});

  const user = useAuthStore((s) => s.user);

  const { data: listRes, isLoading: listLoading } = useProducts({
    page: 1,
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });
  const filtered = useMemo(() => {
    const catalog = listRes?.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((p) => p.name.toLowerCase().includes(q));
  }, [listRes?.data, search]);

  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: variants = [], isLoading: varLoading } = useVariantsByProduct(productId);
  const { data: summary, isLoading: sumLoading } = useStockSummary(productId);
  const adjustMutation = useAdjustVariantStock();

  const setAddRemove = useCallback(
    (id: string, field: "add" | "remove", value: number) => {
      setAdj((prev) => ({
        ...prev,
        [id]: {
          add: field === "add" ? Math.max(0, value) : (prev[id]?.add ?? 0),
          remove: field === "remove" ? Math.max(0, value) : (prev[id]?.remove ?? 0),
        },
      }));
    },
    []
  );

  const primaryImage =
    product?.images?.find((i) => i.isPrimary)?.url ?? product?.images?.[0]?.url;

  const handleSave = () => {
    if (!product || !productId) return;

    const adjustments = variants
      .map((v) => {
        const a = adj[v.id] ?? { add: 0, remove: 0 };
        return {
          variantId: v.id,
          add: a.add,
          remove: a.remove,
          before: v.stock,
        };
      })
      .filter((x) => x.add > 0 || x.remove > 0)
      .map(({ variantId, add, remove, before }) => ({
        variantId,
        add,
        remove,
        before,
        after: Math.max(0, before + add - remove),
      }));

    if (adjustments.length === 0) {
      toast.message("Enter add or remove amounts for at least one variant.");
      return;
    }

    adjustMutation.mutate(
      {
        productId,
        body: {
          adjustments: adjustments.map(({ variantId, add, remove }) => ({
            variantId,
            add,
            remove,
          })),
        },
      },
      {
        onSuccess: () => {
          const entries = adjustments.map((row) => {
            const v = variants.find((x) => x.id === row.variantId);
            return {
              productId,
              productName: product.name,
              variantId: row.variantId,
              sku: v?.sku ?? row.variantId,
              ageRange: v?.ageRange ?? "",
              ageLabel: v ? ageLabel(v.ageRange) : "",
              add: row.add,
              remove: row.remove,
              before: row.before,
              after: row.after,
              reason,
              supplier: supplier || undefined,
              invoice: invoice || undefined,
              notes: notes || undefined,
              adminName: user?.fullName ?? undefined,
            };
          });
          appendStockAuditEntries(entries);
          setAdj({});
          setSupplier("");
          setInvoice("");
          setNotes("");
        },
      }
    );
  };

  const busy = productLoading || varLoading || sumLoading;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/stock"
          className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-xs"
        >
          <ArrowLeft className="h-3 w-3" />
          Stock overview
        </Link>
        <p className="text-muted-foreground text-xs tracking-wider uppercase">
          Stock / Update inventory
        </p>
        <h1 className="font-heading text-3xl font-bold">Update stock</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="Search by product name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-md border">
                {listLoading ? (
                  <p className="text-muted-foreground p-3 text-sm">Loading catalog…</p>
                ) : filtered.length === 0 ? (
                  <p className="text-muted-foreground p-3 text-sm">No products match.</p>
                ) : (
                  <ul className="divide-y">
                    {filtered.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => setManualProductId(p.id)}
                          className={cn(
                            "hover:bg-muted/80 flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                            productId === p.id && "bg-brand-gold/15"
                          )}
                        >
                          <span className="flex-1 truncate font-medium">{p.name}</span>
                          <span className="text-muted-foreground font-mono text-xs">
                            {p.id.slice(0, 8)}…
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {!productId ? (
            <p className="text-muted-foreground text-sm">
              Choose a product to load variants.
            </p>
          ) : busy && !product ? (
            <p className="text-muted-foreground text-sm">Loading product…</p>
          ) : product ? (
            <>
              <Card>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                  <div className="bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border">
                    {primaryImage ? (
                      <Image src={primaryImage} alt="" fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-xl font-bold">{product.name}</h2>
                    <p className="text-muted-foreground text-sm">
                      {product.category?.name ?? "Uncategorized"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="text-brand-gold-dark text-2xl font-bold">
                        {summary?.totalStock ?? totalVariantStock(product)} units
                      </span>
                      {statusBadge(summary?.stockStatus)}
                    </div>
                    {variants[0]?.sku && (
                      <p className="text-muted-foreground font-mono text-xs">
                        Primary SKU: {variants[0].sku}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Age variation &amp; inventory adjustment
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    Variants are keyed by age range (backend{" "}
                    <code className="text-xs">ProductVariant</code>
                    ). New total previews before you save.
                  </p>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground border-b text-left text-xs font-semibold tracking-wider uppercase">
                        <th className="px-4 py-3">Variation</th>
                        <th className="px-4 py-3">Current</th>
                        <th className="px-4 py-3">Add (+)</th>
                        <th className="px-4 py-3">Remove (−)</th>
                        <th className="px-4 py-3">New total</th>
                        <th className="px-4 py-3">Reorder</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {variants.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-muted-foreground px-4 py-8 text-center"
                          >
                            No variants for this product. Add variants from the product
                            edit page.
                          </td>
                        </tr>
                      ) : (
                        variants.map((v) => {
                          const a = adj[v.id] ?? { add: 0, remove: 0 };
                          const next = Math.max(0, v.stock + a.add - a.remove);
                          return (
                            <tr key={v.id} className="hover:bg-muted/30">
                              <td className="px-4 py-3">
                                <p className="font-medium">{ageLabel(v.ageRange)}</p>
                                <p className="text-muted-foreground font-mono text-xs">
                                  {v.sku}
                                </p>
                                {!v.isActive && (
                                  <Badge variant="outline" className="mt-1 text-[10px]">
                                    Inactive
                                  </Badge>
                                )}
                              </td>
                              <td
                                className={cn(
                                  "px-4 py-3",
                                  stockTone(v.stock, v.reorderLevel)
                                )}
                              >
                                {v.stock}
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  min={0}
                                  className="h-9 w-24"
                                  value={a.add || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setAddRemove(
                                      v.id,
                                      "add",
                                      Math.max(0, parseInt(e.target.value, 10) || 0)
                                    )
                                  }
                                />
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  min={0}
                                  className="h-9 w-24"
                                  value={a.remove || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setAddRemove(
                                      v.id,
                                      "remove",
                                      Math.max(0, parseInt(e.target.value, 10) || 0)
                                    )
                                  }
                                />
                              </td>
                              <td className="px-4 py-3 font-mono font-semibold">
                                {next}
                              </td>
                              <td className="text-muted-foreground px-4 py-3">
                                {v.reorderLevel}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update metadata</CardTitle>
              <p className="text-muted-foreground text-xs">
                Stored with the local audit trail when you save adjustments.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase">Adjustment reason</Label>
                <Select value={reason} onValueChange={(v) => v && setReason(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADJUST_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase">Supplier name</Label>
                <Input
                  placeholder="e.g. Silk Road Textiles"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase">Invoice #</Label>
                <Input
                  placeholder="INV-00124"
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase">Notes</Label>
                <Textarea
                  rows={4}
                  placeholder="Batch details, damage notes, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white"
                disabled={
                  !productId ||
                  !variants.length ||
                  adjustMutation.isPending ||
                  !Object.values(adj).some((x) => x.add > 0 || x.remove > 0)
                }
                onClick={handleSave}
              >
                {adjustMutation.isPending ? "Saving…" : "Save stock update"}
              </Button>
              <Link
                href="/dashboard/stock"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-center"
                )}
              >
                Cancel
              </Link>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Audit trail
            </p>
            <p className="mt-1 text-xs text-amber-900/90 dark:text-amber-100/90">
              Successful saves append entries you can review under Stock history. Clearing
              browser storage removes local records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockUpdateWithQueryKey() {
  const searchParams = useSearchParams();
  const urlProductId = searchParams.get("productId") ?? "";
  return <StockUpdatePageContent key={urlProductId} urlProductId={urlProductId} />;
}

export default function StockUpdatePage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground py-16 text-center text-sm">Loading…</div>
      }
    >
      <StockUpdateWithQueryKey />
    </Suspense>
  );
}
