"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  getStockAuditLog,
  STOCK_AUDIT_CHANGE_EVENT,
  STOCK_AUDIT_STORAGE_KEY,
  type StockAuditEntry,
} from "@/lib/stock-audit-log";

function subscribeStockAudit(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STOCK_AUDIT_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(STOCK_AUDIT_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STOCK_AUDIT_CHANGE_EVENT, onChange);
  };
}

function auditSnapshotJson() {
  return JSON.stringify(getStockAuditLog());
}

function formatDayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDayOrdered(entries: StockAuditEntry[]) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );
  const sections: { heading: string; items: StockAuditEntry[] }[] = [];
  let current = "";
  for (const e of sorted) {
    const h = formatDayLabel(e.at);
    if (h !== current) {
      current = h;
      sections.push({ heading: h, items: [e] });
    } else {
      sections[sections.length - 1].items.push(e);
    }
  }
  return sections;
}

function movementType(e: StockAuditEntry): "RESTOCK" | "REMOVE" | "MIXED" {
  if (e.add > 0 && e.remove === 0) return "RESTOCK";
  if (e.remove > 0 && e.add === 0) return "REMOVE";
  return "MIXED";
}

export default function StockHistoryPage() {
  const snapshot = useSyncExternalStore(
    subscribeStockAudit,
    auditSnapshotJson,
    () => "[]"
  );
  const entries = useMemo(() => JSON.parse(snapshot) as StockAuditEntry[], [snapshot]);
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = entries;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.productName.toLowerCase().includes(q) ||
          e.sku.toLowerCase().includes(q) ||
          e.ageLabel.toLowerCase().includes(q)
      );
    }
    if (reasonFilter !== "all") {
      list = list.filter((e) => {
        const r = e.reason ?? "";
        if (reasonFilter === "Damage") return r.includes("Damage");
        if (reasonFilter === "Return") return r.includes("Return");
        if (reasonFilter === "correction") return r.includes("correction");
        return r.includes(reasonFilter);
      });
    }
    return list;
  }, [entries, search, reasonFilter]);

  const grouped = useMemo(() => groupByDayOrdered(filtered), [filtered]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/stock"
            className="text-muted-foreground hover:text-foreground mb-2 inline-flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-3 w-3" />
            Stock overview
          </Link>
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Stock / Audit log
          </p>
          <h1 className="font-heading text-3xl font-bold">Stock history</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Ledger of inventory adjustments saved from this browser. Server-side audit
            APIs can replace this when available.
          </p>
        </div>
        <Button variant="outline" onClick={exportJson} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Quick export
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1 space-y-1">
            <Label className="text-xs uppercase">Search</Label>
            <Input
              placeholder="Product, SKU, age label…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full min-w-[200px] space-y-1 sm:w-56">
            <Label className="text-xs uppercase">Action / reason</Label>
            <Select
              value={reasonFilter}
              onValueChange={(v) => setReasonFilter(v ?? "all")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All movements</SelectItem>
                <SelectItem value="New purchase">New purchase</SelectItem>
                <SelectItem value="Damage">Damage</SelectItem>
                <SelectItem value="Return">Return</SelectItem>
                <SelectItem value="correction">Cycle count correction</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="relative space-y-10 pl-2">
        <div className="bg-border absolute top-2 bottom-2 left-[11px] w-px" />
        {grouped.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No local entries yet. Adjust stock and save from{" "}
            <Link
              href="/dashboard/stock/update"
              className="text-brand-gold-dark font-medium underline"
            >
              Update stock
            </Link>
            .
          </p>
        ) : (
          grouped.map((section) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-muted-foreground pl-8 text-xs font-bold tracking-widest uppercase">
                {section.heading}
              </h2>
              <ul className="space-y-3">
                {section.items.map((e) => {
                  const type = movementType(e);
                  const tagColor =
                    type === "RESTOCK"
                      ? "bg-teal-100 text-teal-900"
                      : type === "REMOVE"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-violet-100 text-violet-900";
                  const delta = e.add - e.remove;
                  return (
                    <li
                      key={e.id}
                      className="bg-card relative flex gap-4 rounded-xl border py-4 pr-4 pl-8 shadow-sm"
                    >
                      <span className="bg-card border-input absolute top-5 -left-1 z-10 h-3 w-3 rounded-full border-2" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={tagColor}>{type}</Badge>
                          <span className="text-muted-foreground text-xs">
                            {new Date(e.at).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="font-medium">
                          {e.productName}{" "}
                          <span className="text-muted-foreground font-normal">
                            · {e.ageLabel}
                          </span>
                        </p>
                        <p className="text-muted-foreground font-mono text-xs">{e.sku}</p>
                        {(e.supplier || e.invoice || e.notes || e.reason) && (
                          <div className="bg-muted/50 rounded-md p-2 text-xs">
                            {e.reason && <p>Reason: {e.reason}</p>}
                            {e.supplier && <p>Supplier: {e.supplier}</p>}
                            {e.invoice && <p>Invoice: {e.invoice}</p>}
                            {e.notes && <p>Notes: {e.notes}</p>}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p
                          className={
                            delta >= 0
                              ? "font-semibold text-emerald-600"
                              : "font-semibold text-red-600"
                          }
                        >
                          {delta >= 0 ? "+" : ""}
                          {delta}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {e.before} → {e.after}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                          {e.adminName ?? "Admin"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
