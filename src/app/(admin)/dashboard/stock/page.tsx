"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ClipboardList, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLowStockVariants, useOutOfStockVariants } from "@/hooks/use-product-variants";
import { AGE_RANGES } from "@/config/constants";

function ageLabel(ageRange: string) {
  return (
    AGE_RANGES.find((a) => a.value === ageRange)?.label ?? ageRange.replace(/_/g, " ")
  );
}

export default function StockManagementPage() {
  const { data: low = [], isLoading: lowLoading } = useLowStockVariants();
  const { data: out = [], isLoading: outLoading } = useOutOfStockVariants();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground text-xs tracking-wider uppercase">
          Stock / Overview
        </p>
        <h1 className="font-heading text-3xl font-bold">Stock management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Monitor variants, adjust inventory, and review local adjustment history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-brand-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Update stock</CardTitle>
            <p className="text-muted-foreground text-sm">
              Add or remove units per variant using the inventory API.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/stock/update">
              <Button className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white">
                <Package className="mr-2 h-4 w-4" />
                Open adjustment tool
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Stock history</CardTitle>
            <p className="text-muted-foreground text-sm">
              Ledger of adjustments saved from this browser (local audit trail).
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/stock/history">
              <Button variant="outline" className="w-full">
                <ClipboardList className="mr-2 h-4 w-4" />
                View audit log
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-muted/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick counts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Low stock variants</span>
              <span className="font-semibold">{lowLoading ? "…" : low.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Out of stock</span>
              <span className="font-semibold text-red-600">
                {outLoading ? "…" : out.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Needs attention (low stock)</CardTitle>
            <Badge variant="secondary">{low.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowLoading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : low.length === 0 ? (
              <p className="text-muted-foreground text-sm">No low-stock variants.</p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {low.slice(0, 12).map((v) => {
                  const img = v.product?.images?.[0]?.url;
                  return (
                    <li
                      key={v.id}
                      className="bg-card flex items-center gap-3 rounded-lg border p-2 text-sm"
                    >
                      <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                        {img ? (
                          <Image src={img} alt="" fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {v.product?.name ?? "Product"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {ageLabel(v.ageRange)} · {v.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-semibold">{v.stock}</p>
                        <p className="text-muted-foreground text-[10px]">
                          ≤ {v.reorderLevel} reorder
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/stock/update?productId=${v.product?.id ?? ""}`}
                      >
                        <Button size="sm" variant="outline">
                          Fix
                        </Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="text-destructive h-4 w-4" />
              Out of stock
            </CardTitle>
            <Badge variant="destructive">{out.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {outLoading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : out.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                All active variants have stock.
              </p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto">
                {out.slice(0, 12).map((v) => {
                  const img = v.product?.images?.[0]?.url;
                  return (
                    <li
                      key={v.id}
                      className="bg-card flex items-center gap-3 rounded-lg border p-2 text-sm"
                    >
                      <div className="bg-muted relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                        {img ? (
                          <Image src={img} alt="" fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {v.product?.name ?? "Product"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {ageLabel(v.ageRange)} · {v.sku}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/stock/update?productId=${v.product?.id ?? ""}`}
                      >
                        <Button
                          size="sm"
                          className="bg-brand-gold hover:bg-brand-gold-dark"
                        >
                          Restock
                        </Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
