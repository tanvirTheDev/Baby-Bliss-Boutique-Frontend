"use client";

import { Pagination } from "@/components/ecommerce/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveReturn,
  useCompleteReturn,
  useReceiveReturn,
  useRejectReturn,
  useReturnDetail,
  useReturnsList,
} from "@/hooks/use-returns";
import { formatBDT } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type {
  OrderReturn,
  ReturnReason,
  ReturnStatus,
  ReturnType,
} from "@/services/returns";
import { Eye, Loader2, Package, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const STATUS_STYLES: Record<ReturnStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  RECEIVED: "bg-sky-100 text-sky-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-violet-100 text-violet-800",
};

const REASON_LABELS: Record<ReturnReason, string> = {
  WRONG_ITEM: "Wrong item",
  DAMAGED: "Damaged",
  NOT_AS_DESCRIBED: "Not as described",
  CHANGED_MIND: "Changed mind",
  OTHER: "Other",
};

function statusLabel(s: ReturnStatus): string {
  return s.replace(/_/g, " ");
}

function buildItemApprovalState(
  items: OrderReturn["returnItems"]
): Record<string, { isDamaged: boolean; refundAmount: string }> {
  const o: Record<string, { isDamaged: boolean; refundAmount: string }> = {};
  for (const ri of items) {
    o[ri.id] = { isDamaged: false, refundAmount: "" };
  }
  return o;
}

function ReturnDetailBody({
  detail,
  onClose,
}: {
  detail: OrderReturn;
  onClose: () => void;
}) {
  const receiveMut = useReceiveReturn();
  const approveMut = useApproveReturn();
  const rejectMut = useRejectReturn();
  const completeMut = useCompleteReturn();

  const [receiveNote, setReceiveNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [approveRefundMethod, setApproveRefundMethod] = useState("BKASH");
  const [approveDeliveryRefunded, setApproveDeliveryRefunded] = useState(false);
  const [approveAdminNote, setApproveAdminNote] = useState("");
  const [itemApproval, setItemApproval] = useState(() =>
    buildItemApprovalState(detail.returnItems)
  );
  const [completeNote, setCompleteNote] = useState("");
  const [completeTxnId, setCompleteTxnId] = useState("");
  const [completePhone, setCompletePhone] = useState("");

  const busy =
    receiveMut.isPending ||
    approveMut.isPending ||
    rejectMut.isPending ||
    completeMut.isPending;

  const handleReceive = () => {
    receiveMut.mutate(
      { id: detail.id, adminNote: receiveNote.trim() || undefined },
      { onSuccess: onClose }
    );
  };

  const handleReject = () => {
    const note = rejectNote.trim();
    if (!note) return;
    rejectMut.mutate(
      { id: detail.id, body: { adminNote: note } },
      { onSuccess: onClose }
    );
  };

  const handleApprove = () => {
    if (!detail.returnItems?.length) return;
    const method = approveRefundMethod.trim();
    if (!method) return;
    const items = detail.returnItems.map((ri) => {
      const row = itemApproval[ri.id] ?? { isDamaged: false, refundAmount: "" };
      const raw = row.refundAmount.trim();
      const refundAmount =
        raw === "" ? undefined : Math.max(0, Number.parseFloat(raw) || 0);
      return {
        returnItemId: ri.id,
        isDamaged: row.isDamaged,
        ...(refundAmount !== undefined ? { refundAmount } : {}),
      };
    });
    approveMut.mutate(
      {
        id: detail.id,
        body: {
          refundMethod: method,
          deliveryRefunded: approveDeliveryRefunded,
          ...(approveAdminNote.trim() ? { adminNote: approveAdminNote.trim() } : {}),
          items,
        },
      },
      { onSuccess: onClose }
    );
  };

  const handleComplete = () => {
    const body: {
      adminNote?: string;
      refundTransactionId?: string;
      refundPhoneNumber?: string;
    } = {};
    if (completeNote.trim()) body.adminNote = completeNote.trim();
    if (detail.returnType === "RETURN") {
      if (completeTxnId.trim()) body.refundTransactionId = completeTxnId.trim();
      if (completePhone.trim()) body.refundPhoneNumber = completePhone.trim();
    }
    completeMut.mutate({ id: detail.id, body }, { onSuccess: onClose });
  };

  const canReceive = detail.status === "PENDING";
  const canApproveOrReject = detail.status === "PENDING" || detail.status === "RECEIVED";
  const canComplete = detail.status === "APPROVED";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn(STATUS_STYLES[detail.status])}>
          {statusLabel(detail.status)}
        </Badge>
        <Badge variant="outline">{detail.returnType}</Badge>
        <Badge variant="secondary">{REASON_LABELS[detail.reason]}</Badge>
      </div>

      {detail.note && (
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">Customer note: </span>
          {detail.note}
        </p>
      )}

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-xs uppercase">Customer</p>
          <p className="font-medium">{detail.user?.fullName ?? "—"}</p>
          <p className="text-muted-foreground text-xs">{detail.user?.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Order</p>
          <p className="font-mono text-xs break-all">{detail.orderId}</p>
          {detail.order && (
            <p className="text-muted-foreground mt-1 text-xs">
              Order status {detail.order.status} · Payment {detail.order.paymentStatus} ·
              Total {formatBDT(detail.order.totalAmount)} · Delivery{" "}
              {formatBDT(detail.order.deliveryCharge)}
            </p>
          )}
          <Link
            href="/dashboard/orders"
            className="text-brand-gold mt-2 inline-block text-xs font-medium hover:underline"
          >
            Open orders list
          </Link>
        </div>
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-sm font-medium">Line items</p>
        <div className="space-y-2 rounded-md border">
          {detail.returnItems.map((ri) => (
            <div
              key={ri.id}
              className="flex flex-col gap-1 border-b p-3 text-sm last:border-0"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">{ri.orderItem.productName}</span>
                <span className="text-muted-foreground text-xs">
                  Qty {ri.quantity} · {formatBDT(ri.orderItem.unitPrice)} each
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                SKU {ri.orderItem.sku} · Age {ri.orderItem.ageRange}
                {ri.exchangeVariant && (
                  <span>
                    {" "}
                    → Exchange to {ri.exchangeVariant.ageRange} ({ri.exchangeVariant.sku})
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {(detail.adminNote || detail.totalRefundAmount != null) && (
        <div className="bg-muted/40 rounded-md p-3 text-sm">
          {detail.adminNote && (
            <p>
              <span className="font-medium">Admin note: </span>
              {detail.adminNote}
            </p>
          )}
          {detail.refundMethod && (
            <p className="text-muted-foreground mt-1 text-xs">
              Refund method: {detail.refundMethod}
              {detail.deliveryRefunded ? " · Delivery refunded" : ""}
            </p>
          )}
          {detail.totalRefundAmount != null && (
            <p className="mt-1">
              Total refund amount:{" "}
              <span className="font-semibold">{formatBDT(detail.totalRefundAmount)}</span>
            </p>
          )}
        </div>
      )}

      <Separator />

      {canReceive && (
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm font-medium">Mark as received</p>
          <p className="text-muted-foreground text-xs">
            Use when the package has arrived at the warehouse (still pending approval).
          </p>
          <Textarea
            placeholder="Optional note for warehouse / customer"
            value={receiveNote}
            onChange={(e) => setReceiveNote(e.target.value)}
            rows={2}
          />
          <Button
            type="button"
            className="bg-brand-gold hover:bg-brand-gold-dark text-white"
            disabled={busy}
            onClick={handleReceive}
          >
            Mark received
          </Button>
        </div>
      )}

      {canApproveOrReject && (
        <div className="space-y-4 rounded-lg border p-4">
          <p className="text-sm font-medium">Approve or reject</p>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Refund method (required for approval)</Label>
              <Input
                value={approveRefundMethod}
                onChange={(e) => setApproveRefundMethod(e.target.value)}
                placeholder="e.g. BKASH, NAGAD, bank transfer"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="deliveryRefunded"
                checked={approveDeliveryRefunded}
                onCheckedChange={(c) => setApproveDeliveryRefunded(c === true)}
              />
              <Label htmlFor="deliveryRefunded" className="text-sm font-normal">
                Refund delivery charge to customer
              </Label>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Admin note (optional)</Label>
              <Textarea
                value={approveAdminNote}
                onChange={(e) => setApproveAdminNote(e.target.value)}
                rows={2}
              />
            </div>

            <p className="text-xs font-medium">Per item</p>
            {detail.returnItems.map((ri) => {
              const row = itemApproval[ri.id] ?? {
                isDamaged: false,
                refundAmount: "",
              };
              return (
                <div
                  key={ri.id}
                  className="bg-muted/30 flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-end"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      {ri.orderItem.productName}
                    </p>
                    <p className="text-muted-foreground text-[10px]">
                      Auto refund ≈ {formatBDT(ri.orderItem.unitPrice * ri.quantity)} if
                      not damaged
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`dmg-${ri.id}`}
                      checked={row.isDamaged}
                      onCheckedChange={(c) =>
                        setItemApproval((prev) => ({
                          ...prev,
                          [ri.id]: {
                            ...row,
                            isDamaged: c === true,
                          },
                        }))
                      }
                    />
                    <Label htmlFor={`dmg-${ri.id}`} className="text-xs font-normal">
                      Damaged (no refund / no exchange ship)
                    </Label>
                  </div>
                  <div className="w-full sm:w-32">
                    <Label className="text-[10px]">Override refund (optional)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="Auto"
                      value={row.refundAmount}
                      onChange={(e) =>
                        setItemApproval((prev) => ({
                          ...prev,
                          [ri.id]: {
                            ...row,
                            refundAmount: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                type="button"
                className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                disabled={busy || !approveRefundMethod.trim()}
                onClick={handleApprove}
              >
                Approve return
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs">Reject (requires note)</Label>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Reason for rejection"
              rows={2}
            />
            <Button
              type="button"
              variant="destructive"
              disabled={busy || !rejectNote.trim()}
              onClick={handleReject}
            >
              Reject return
            </Button>
          </div>
        </div>
      )}

      {canComplete && (
        <div className="space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Complete</p>
          <p className="text-muted-foreground text-xs">
            {detail.returnType === "RETURN"
              ? "Record refund transaction details (optional fields) and mark complete."
              : "Mark the exchange as fully completed / dispatched."}
          </p>
          <Textarea
            placeholder="Admin note (optional)"
            value={completeNote}
            onChange={(e) => setCompleteNote(e.target.value)}
            rows={2}
          />
          {detail.returnType === "RETURN" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Refund transaction ID</Label>
                <Input
                  value={completeTxnId}
                  onChange={(e) => setCompleteTxnId(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Refund phone</Label>
                <Input
                  value={completePhone}
                  onChange={(e) => setCompletePhone(e.target.value)}
                />
              </div>
            </div>
          )}
          <Button
            type="button"
            className="bg-brand-olive hover:bg-brand-olive/90 text-white"
            disabled={busy}
            onClick={handleComplete}
          >
            Mark completed
          </Button>
        </div>
      )}

      {!canReceive && !canApproveOrReject && !canComplete && (
        <p className="text-muted-foreground text-sm">
          No actions available for this status ({detail.status}).
        </p>
      )}
    </div>
  );
}

export default function AdminReturnsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const limit = 10;

  const listParams = useMemo(
    () => ({
      page,
      limit,
      ...(statusFilter !== "all" ? { status: statusFilter as ReturnStatus } : {}),
      ...(typeFilter !== "all" ? { returnType: typeFilter as ReturnType } : {}),
    }),
    [page, limit, statusFilter, typeFilter]
  );

  const { data: listRes, isLoading } = useReturnsList(listParams);
  const returns = listRes?.data ?? [];
  const meta = listRes?.meta;

  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: detail, isLoading: detailLoading } = useReturnDetail(detailId);

  const openDetail = (id: string) => setDetailId(id);
  const closeDetail = () => setDetailId(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-xs tracking-wider uppercase">
          Dashboard / Returns
        </p>
        <h1 className="font-heading text-3xl font-bold">Returns & exchanges</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review customer return requests, mark items received, approve or reject, and
          complete refunds.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="RECEIVED">Received</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="RETURN">Return</SelectItem>
            <SelectItem value="EXCHANGE">Exchange</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
            </div>
          ) : returns.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-16">
              <RotateCcw className="h-10 w-10 opacity-40" />
              <p>No returns match these filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b text-left">
                    <th className="px-4 py-3 font-medium">Return</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r: OrderReturn) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.id.slice(0, 12)}…
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[180px] truncate">
                          {r.user?.fullName ?? r.user?.email ?? r.userId.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.orderId.slice(0, 12)}…
                      </td>
                      <td className="px-4 py-3">{r.returnType}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn("text-xs", STATUS_STYLES[r.status])}>
                          {statusLabel(r.status)}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-xs">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(r.id)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      )}

      <Dialog open={!!detailId} onOpenChange={(o) => !o && closeDetail()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Return request
            </DialogTitle>
            <DialogDescription>
              {detailId && (
                <span className="font-mono text-xs break-all">{detailId}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !detail ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ReturnDetailBody key={detail.id} detail={detail} onClose={closeDetail} />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDetail}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
