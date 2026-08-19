"use client";

import { Copy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AGE_RANGES } from "@/config/constants";
import { cn } from "@/lib/utils";

export interface AgeVariantRow {
  ageRange: string;
  enabled: boolean;
  /** Kept as strings so a half-typed value like "12." does not fight the input. */
  price: string;
  stock: string;
  /** Present when the row maps to a variant that already exists in the DB. */
  variantId?: string;
}

/** One row per age band, all disabled — the starting point for a new product. */
export function emptyAgeRows(): AgeVariantRow[] {
  return AGE_RANGES.map((ar) => ({
    ageRange: ar.value,
    enabled: false,
    price: "",
    stock: "",
  }));
}

export function rowsToVariants(rows: AgeVariantRow[]) {
  return rows
    .filter((r) => r.enabled)
    .map((r) => ({
      ageRange: r.ageRange,
      price: Number(r.price),
      stock: Math.max(0, Math.floor(Number(r.stock) || 0)),
      reorderLevel: 10,
      isActive: true,
    }));
}

/** Returns a human-readable problem, or null when the rows are submittable. */
export function validateAgeRows(rows: AgeVariantRow[]): string | null {
  const selected = rows.filter((r) => r.enabled);
  if (selected.length === 0) return "Select at least one age range.";

  const unpriced = selected.filter(
    (r) => r.price === "" || !Number.isFinite(Number(r.price)) || Number(r.price) <= 0
  );
  if (unpriced.length > 0) {
    const labels = unpriced
      .map((r) => AGE_RANGES.find((a) => a.value === r.ageRange)?.label ?? r.ageRange)
      .join(", ");
    return `Enter a price greater than 0 for: ${labels}`;
  }

  return null;
}

interface AgePriceTableProps {
  rows: AgeVariantRow[];
  onChange: (rows: AgeVariantRow[]) => void;
  className?: string;
}

export function AgePriceTable({ rows, onChange, className }: AgePriceTableProps) {
  const patch = (ageRange: string, changes: Partial<AgeVariantRow>) => {
    onChange(rows.map((r) => (r.ageRange === ageRange ? { ...r, ...changes } : r)));
  };

  const selectedCount = rows.filter((r) => r.enabled).length;

  // 16 age bands is a lot of typing when most share a price.
  const copyFirstPriceDown = () => {
    const first = rows.find((r) => r.enabled && r.price !== "");
    if (!first) return;
    onChange(rows.map((r) => (r.enabled ? { ...r, price: first.price } : r)));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label className="text-xs">Price &amp; stock by age</Label>
          <p className="text-muted-foreground text-[11px]">
            Tick each age this product is made for, then set its own price and stock. At
            least one is required.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px]">
            {selectedCount} selected
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyFirstPriceDown}
            disabled={selectedCount < 2}
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Same price for all
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="bg-muted/50 text-muted-foreground grid grid-cols-[1fr_120px_100px] gap-2 border-b px-3 py-2 text-[11px] font-medium">
          <span>Age range</span>
          <span>Price (৳)</span>
          <span>Stock</span>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {rows.map((row) => {
            const label =
              AGE_RANGES.find((a) => a.value === row.ageRange)?.label ?? row.ageRange;

            return (
              <div
                key={row.ageRange}
                className={cn(
                  "grid grid-cols-[1fr_120px_100px] items-center gap-2 border-b px-3 py-2 last:border-b-0",
                  row.enabled ? "bg-background" : "bg-muted/20"
                )}
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={row.enabled}
                    onCheckedChange={(on) =>
                      patch(row.ageRange, { enabled: on === true })
                    }
                  />
                  <span className={cn(!row.enabled && "text-muted-foreground")}>
                    {label}
                  </span>
                </label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="h-8"
                  disabled={!row.enabled}
                  value={row.price}
                  onChange={(e) => patch(row.ageRange, { price: e.target.value })}
                />

                <Input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="0"
                  className="h-8"
                  disabled={!row.enabled}
                  value={row.stock}
                  onChange={(e) => patch(row.ageRange, { stock: e.target.value })}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
