"use client";

import Link from "next/link";
import { useState } from "react";
import { Pagination } from "@/components/ecommerce/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyReturns } from "@/hooks/use-returns";
import { formatBDT } from "@/lib/currency";
import { Loader2 } from "lucide-react";
import type { ReturnStatus, ReturnType } from "@/services/returns";

const statusVariant: Partial<
  Record<ReturnStatus, "default" | "secondary" | "destructive" | "outline">
> = {
  PENDING: "secondary",
  RECEIVED: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
  COMPLETED: "outline",
};

function typeLabel(t: ReturnType) {
  return t === "EXCHANGE" ? "Exchange" : "Return";
}

export default function AccountReturnsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useMyReturns({ page, limit });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Returns & exchanges</h2>
        <p className="text-muted-foreground text-sm">
          View status of return and exchange requests. Delivered orders can start a new
          request from{" "}
          <Link href="/account/orders" className="text-primary underline">
            My Orders
          </Link>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="text-brand-gold h-7 w-7 animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              You have not submitted any returns or exchanges yet.
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className="bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {typeLabel(r.returnType)}{" "}
                        <span className="text-muted-foreground font-mono font-normal">
                          · {r.id.slice(0, 10)}…
                        </span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                      {r.order ? (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Order total {formatBDT(r.order.totalAmount)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge
                        variant={statusVariant[r.status] ?? "secondary"}
                        className="uppercase"
                      >
                        {r.status}
                      </Badge>
                      <Link
                        href={`/account/returns/${r.id}`}
                        className="text-primary text-xs font-medium hover:underline"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 ? (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
