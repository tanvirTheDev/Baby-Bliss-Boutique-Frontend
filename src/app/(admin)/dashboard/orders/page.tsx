"use client";

import { Pagination } from "@/components/ecommerce/pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useVariantsByProduct } from "@/hooks/use-product-variants";
import {
  useAdminCreateOrder,
  useDeleteOrder,
  useOrder,
  useOrders,
  useUpdateOrderPaymentStatus,
  useUpdateOrderStatus,
} from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useUserShippingAddresses } from "@/hooks/use-shipping-addresses";
import { useUsers } from "@/hooks/use-users";
import { formatBDT } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  UpdateOrderStatusPayload,
} from "@/services/orders";
import {
  AlertTriangle,
  Eye,
  Loader2,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ModalMode = "view" | "edit" | "delete" | "create" | null;

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-800",
  UNPAID: "bg-slate-100 text-slate-700",
  PENDING: "bg-amber-50 text-amber-800",
  FAILED: "bg-red-50 text-red-800",
  REFUNDED: "bg-indigo-50 text-indigo-800",
};

/** Matches backend VALID_TRANSITIONS in services/orders (updateOrderStatus) */
const NEXT_ORDER_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "COD", label: "Cash on delivery" },
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
  { value: "ROCKET", label: "Rocket" },
  { value: "ONLINE", label: "Online" },
];

function snapshotLabel(s: unknown): string {
  if (!s || typeof s !== "object") return "—";
  const o = s as Record<string, unknown>;
  const parts = [o.fullName, o.phoneNumber, o.street, o.upazila, o.district].filter(
    Boolean
  );
  return parts.length ? String(parts.join(" · ")).slice(0, 80) : "—";
}

function primaryImageUrl(item: Order["orderItems"][0]): string | null {
  const imgs = item.product?.images;
  if (!imgs?.length) return null;
  const primary = imgs.find((i) => i.isPrimary) ?? imgs[0];
  return primary?.url ?? null;
}

function LineVariantSelect({
  productId,
  value,
  onChange,
  disabled,
}: {
  productId: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const { data: variants, isLoading } = useVariantsByProduct(productId);
  const rows = variants ?? [];
  return (
    <Select
      value={value || "__none__"}
      onValueChange={(v) => onChange(v === "__none__" ? "" : (v ?? ""))}
      disabled={disabled || !productId}
    >
      <SelectTrigger className="h-9 min-w-[160px]">
        <SelectValue placeholder={isLoading ? "Loading…" : "Variant"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Variant —</SelectItem>
        {rows
          .filter((v) => v.isActive)
          .map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.ageRange} · {v.sku} ({v.stock} in stock)
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

export default function OrdersAdminPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const limit = 10;

  const listParams = useMemo(
    () => ({
      page,
      limit,
      ...(statusFilter !== "all" ? { orderStatus: statusFilter as OrderStatus } : {}),
      ...(paymentFilter !== "all"
        ? { paymentStatus: paymentFilter as PaymentStatus }
        : {}),
    }),
    [page, limit, statusFilter, paymentFilter]
  );

  const { data: listRes, isLoading } = useOrders(listParams);
  const orders = listRes?.data ?? [];
  const pagination = listRes?.pagination;

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: detailRes } = useOrder(activeId ?? "");
  const detail = detailRes?.data;

  const [editStatus, setEditStatus] = useState<OrderStatus>("PENDING");
  const [editPayment, setEditPayment] = useState<PaymentStatus>("UNPAID");
  const [editTracking, setEditTracking] = useState("");
  const [editCancelReason, setEditCancelReason] = useState("");

  const createMutation = useAdminCreateOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const updatePaymentMutation = useUpdateOrderPaymentStatus();
  const deleteMutation = useDeleteOrder();

  const { data: usersRes } = useUsers({ role: "CUSTOMER", limit: 100, page: 1 });
  const customers = usersRes?.data ?? [];

  const [createUserId, setCreateUserId] = useState("");
  const { data: addresses = [] } = useUserShippingAddresses(createUserId);
  const [createAddressId, setCreateAddressId] = useState("");
  const [createCoupon, setCreateCoupon] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [createPaymentMethod, setCreatePaymentMethod] = useState<PaymentMethod>("COD");
  const [createPhone, setCreatePhone] = useState("");
  const [lineItems, setLineItems] = useState<
    { productId: string; variantId: string; quantity: string }[]
  >([{ productId: "", variantId: "", quantity: "1" }]);

  const { data: productsRes } = useProducts({ page: 1, limit: 100, sortBy: "createdAt" });
  const catalog = productsRes?.data ?? [];

  const openView = (id: string) => {
    setActiveId(id);
    setModalMode("view");
  };

  const openEdit = (o: Order) => {
    setActiveId(o.id);
    setEditStatus(o.status);
    setEditPayment(o.paymentStatus);
    setEditTracking(o.trackingNumber ?? "");
    setEditCancelReason("");
    setModalMode("edit");
  };

  const openDelete = (id: string) => {
    setActiveId(id);
    setModalMode("delete");
  };

  const openCreate = () => {
    setCreateUserId("");
    setCreateAddressId("");
    setCreateCoupon("");
    setCreateNotes("");
    setCreatePaymentMethod("COD");
    setCreatePhone("");
    setLineItems([{ productId: "", variantId: "", quantity: "1" }]);
    setModalMode("create");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveId(null);
  };

  const handleSaveEdit = async () => {
    if (!activeId || !detail) return;
    const goingShipped = editStatus === "SHIPPED" && detail.status !== "SHIPPED";
    if (goingShipped && !editTracking.trim()) {
      toast.error("Tracking number is required when marking the order as shipped");
      return;
    }
    const goingCancelled = editStatus === "CANCELLED" && detail.status !== "CANCELLED";
    if (goingCancelled && !editCancelReason.trim()) {
      toast.error("Cancel reason is required when cancelling an order");
      return;
    }
    try {
      if (editPayment !== detail.paymentStatus) {
        await updatePaymentMutation.mutateAsync({
          id: activeId,
          paymentStatus: editPayment,
        });
      }
      if (editStatus !== detail.status) {
        const payload: UpdateOrderStatusPayload = { status: editStatus };
        if (editStatus === "SHIPPED") payload.trackingNumber = editTracking.trim();
        if (editStatus === "CANCELLED") payload.cancelReason = editCancelReason.trim();
        await updateStatusMutation.mutateAsync({ id: activeId, data: payload });
      }
      closeModal();
    } catch {
      /* errors toasted by hooks */
    }
  };

  const handleDelete = () => {
    if (!activeId) return;
    deleteMutation.mutate(activeId, { onSuccess: closeModal });
  };

  const addLine = () => {
    setLineItems((rows) => [...rows, { productId: "", variantId: "", quantity: "1" }]);
  };

  const setLine = (
    i: number,
    patch: Partial<{ productId: string; variantId: string; quantity: string }>
  ) => {
    setLineItems((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };

  const removeLine = (i: number) => {
    setLineItems((rows) => (rows.length <= 1 ? rows : rows.filter((_, j) => j !== i)));
  };

  const handleCreateSubmit = () => {
    const items = lineItems
      .map((r) => ({
        productId: r.productId,
        variantId: r.variantId,
        quantity: Math.max(1, parseInt(r.quantity, 10) || 0),
      }))
      .filter((r) => r.productId && r.variantId);
    if (!createUserId || !createAddressId || items.length === 0) return;
    if (createPaymentMethod === "COD" && !createPhone.trim()) {
      toast.error("Phone number is required for Cash on Delivery");
      return;
    }
    const notesTrim = createNotes.trim();
    createMutation.mutate(
      {
        userId: createUserId,
        shippingAddressId: createAddressId,
        items,
        paymentMethod: createPaymentMethod,
        ...(createPaymentMethod === "COD" ? { phoneNumber: createPhone.trim() } : {}),
        ...(createCoupon.trim() ? { couponCode: createCoupon.trim().toUpperCase() } : {}),
        ...(notesTrim ? { notes: notesTrim.slice(0, 2000) } : {}),
      },
      { onSuccess: closeModal }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Dashboard / Orders
          </p>
          <h1 className="font-heading text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View, update status, create orders for customers, or remove records.
          </p>
        </div>
        <Button
          className="bg-brand-gold hover:bg-brand-gold-dark text-white"
          onClick={openCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          New order
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All order statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={paymentFilter}
          onValueChange={(v) => {
            setPaymentFilter(v ?? "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="text-muted-foreground grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_100px_110px_110px_100px_120px] items-center gap-3 border-b px-4 py-3 text-xs font-semibold tracking-wider uppercase max-xl:hidden">
            <span>Order</span>
            <span>Customer</span>
            <span className="text-center">Items</span>
            <span>Status</span>
            <span>Payment</span>
            <span>Date</span>
            <span className="text-center">Actions</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-3 py-20">
              <ShoppingBag className="h-10 w-10 opacity-40" />
              <p>No orders found.</p>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="grid grid-cols-1 gap-3 border-b px-4 py-4 last:border-b-0 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_100px_110px_110px_100px_120px] xl:items-center"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{o.id.slice(0, 12)}…</p>
                  <p className="text-muted-foreground text-xs">
                    {formatBDT(o.totalAmount)}
                  </p>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px]">
                      {(o.user?.fullName ?? "?")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {o.user?.fullName ?? "—"}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {o.user?.email ?? o.userId.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-center text-sm">
                  {o.orderItems?.length ?? 0}
                </p>
                <Badge
                  variant="secondary"
                  className={cn("w-fit uppercase", STATUS_STYLES[o.status])}
                >
                  {o.status}
                </Badge>
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="outline"
                    className={cn("w-fit uppercase", PAYMENT_STYLES[o.paymentStatus])}
                  >
                    {o.paymentStatus}
                  </Badge>
                  {o.payment?.paymentMethod && (
                    <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                      {o.payment.paymentMethod}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {new Date(o.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openView(o.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(o)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => openDelete(o.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <Dialog
        open={modalMode === "view"}
        onOpenChange={(o) => {
          if (!o) closeModal();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order detail</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {activeId}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge className={STATUS_STYLES[detail.status]}>{detail.status}</Badge>
                <Badge variant="outline" className={PAYMENT_STYLES[detail.paymentStatus]}>
                  {detail.paymentStatus}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">Customer</p>
                <p className="font-medium">{detail.user?.fullName ?? "—"}</p>
                <p className="text-muted-foreground text-xs">{detail.user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  Ship to (snapshot)
                </p>
                <p>{snapshotLabel(detail.shippingSnapshot)}</p>
              </div>
              {detail.payment && (
                <div className="space-y-1 border-t pt-3">
                  <p className="text-muted-foreground text-xs uppercase">Payment</p>
                  <p className="font-medium uppercase">{detail.payment.paymentMethod}</p>
                  {detail.payment.paymentMethod !== "COD" && (
                    <div className="mt-1 space-y-1 text-xs">
                      {detail.payment.transactionId && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-28 shrink-0">
                            Transaction ID
                          </span>
                          <span className="font-mono font-medium">
                            {detail.payment.transactionId}
                          </span>
                        </div>
                      )}
                      {detail.payment.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-28 shrink-0">
                            Phone
                          </span>
                          <span className="font-medium">
                            {detail.payment.phoneNumber}
                          </span>
                        </div>
                      )}
                      {detail.payment.paymentScreenshot && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground w-28 shrink-0">
                            Screenshot
                          </span>
                          <a
                            href={detail.payment.paymentScreenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-2"
                          >
                            View
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {detail.coupon && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Coupon</p>
                  <p className="font-mono">{detail.coupon.code}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 border-t pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">{formatBDT(detail.subtotal)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Discount</p>
                  <p className="font-medium">{formatBDT(detail.discountAmount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold">{formatBDT(detail.totalAmount)}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-xs uppercase">Line items</p>
                <ul className="space-y-3">
                  {detail.orderItems.map((item) => {
                    const url = primaryImageUrl(item);
                    return (
                      <li
                        key={item.id}
                        className="flex gap-3 border-b border-dashed pb-3 last:border-0"
                      >
                        <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                          {url ? (
                            <Image src={url} alt="" fill className="object-cover" />
                          ) : (
                            <div className="text-muted-foreground flex h-full items-center justify-center text-[10px]">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="leading-tight font-medium">{item.productName}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.quantity} × {formatBDT(item.unitPrice)}
                          </p>
                        </div>
                        <p className="shrink-0 font-medium">
                          {formatBDT(item.unitPrice * item.quantity)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {detail.notes && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Notes</p>
                  <p className="whitespace-pre-wrap">{detail.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalMode === "edit"}
        onOpenChange={(o) => {
          if (!o) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update order</DialogTitle>
            <DialogDescription>
              Allowed status moves follow store rules (e.g. tracking when shipping, reason
              when cancelling). Payment status can be updated separately.
            </DialogDescription>
          </DialogHeader>
          {!detail ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                {detail.status === "DELIVERED" || detail.status === "CANCELLED" ? (
                  <p className="text-muted-foreground text-sm">
                    Fulfillment status is final ({detail.status}). You can still adjust
                    payment status if needed.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs uppercase">Order status</Label>
                    <Select
                      value={editStatus}
                      onValueChange={(v) =>
                        setEditStatus((v ?? "PENDING") as OrderStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          new Set<OrderStatus>([
                            detail.status,
                            ...NEXT_ORDER_STATUSES[detail.status],
                          ])
                        ).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {editStatus === "SHIPPED" && detail.status !== "SHIPPED" ? (
                  <div className="space-y-2">
                    <Label className="text-xs uppercase">Tracking number</Label>
                    <Input
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="Required to mark as shipped"
                    />
                  </div>
                ) : null}
                {editStatus === "CANCELLED" && detail.status !== "CANCELLED" ? (
                  <div className="space-y-2">
                    <Label className="text-xs uppercase">Cancel reason</Label>
                    <Textarea
                      value={editCancelReason}
                      onChange={(e) => setEditCancelReason(e.target.value)}
                      rows={2}
                      placeholder="Required when cancelling"
                      maxLength={500}
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label className="text-xs uppercase">Payment status</Label>
                  <Select
                    value={editPayment}
                    onValueChange={(v) =>
                      setEditPayment((v ?? "UNPAID") as PaymentStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {detail.notes ? (
                  <div className="space-y-1">
                    <Label className="text-xs uppercase">Order notes (read-only)</Label>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                      {detail.notes}
                    </p>
                  </div>
                ) : null}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                  onClick={() => void handleSaveEdit()}
                  disabled={
                    updateStatusMutation.isPending || updatePaymentMutation.isPending
                  }
                >
                  {updateStatusMutation.isPending || updatePaymentMutation.isPending
                    ? "Saving…"
                    : "Save"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalMode === "delete"}
        onOpenChange={(o) => {
          if (!o) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Delete order</DialogTitle>
            <DialogDescription className="text-center">
              Permanently remove this order and its line items. Stock is not restored
              automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalMode === "create"}
        onOpenChange={(o) => {
          if (!o) closeModal();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create order (admin)</DialogTitle>
            <DialogDescription>
              Places an order for a customer using their saved address. Stock is
              decremented like checkout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase">Customer</Label>
              <Select
                value={createUserId || "__none__"}
                onValueChange={(v) => {
                  const val = v ?? "__none__";
                  setCreateUserId(val === "__none__" ? "" : val);
                  setCreateAddressId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select —</SelectItem>
                  {customers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Shipping address</Label>
              <Select
                value={createAddressId || "__none__"}
                onValueChange={(v) => {
                  const val = v ?? "__none__";
                  const id = val === "__none__" ? "" : val;
                  setCreateAddressId(id);
                  const addr = addresses.find((a) => a.id === id);
                  if (addr?.phoneNumber) setCreatePhone(addr.phoneNumber);
                }}
                disabled={!createUserId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select address" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select —</SelectItem>
                  {addresses.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.fullName} — {a.street}, {a.upazila}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Payment method</Label>
              <Select
                value={createPaymentMethod}
                onValueChange={(v) =>
                  setCreatePaymentMethod((v ?? "COD") as PaymentMethod)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {createPaymentMethod === "COD" ? (
              <div className="space-y-2">
                <Label className="text-xs uppercase">Phone (COD)</Label>
                <Input
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="Required for cash on delivery"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase">Products</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="mr-1 h-3 w-3" /> Line
                </Button>
              </div>
              <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {lineItems.map((row, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <Select
                        value={row.productId || "__none__"}
                        onValueChange={(v) => {
                          const val = v ?? "__none__";
                          setLine(i, {
                            productId: val === "__none__" ? "" : val,
                            variantId: "",
                          });
                        }}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Product —</SelectItem>
                          {catalog.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name.slice(0, 48)}
                              {p.name.length > 48 ? "…" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <LineVariantSelect
                      productId={row.productId}
                      value={row.variantId}
                      onChange={(variantId) => setLine(i, { variantId })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="h-9 w-20"
                      value={row.quantity}
                      onChange={(e) => setLine(i, { quantity: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => removeLine(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Coupon code (optional)</Label>
              <Input
                value={createCoupon}
                onChange={(e) => setCreateCoupon(e.target.value.toUpperCase())}
                placeholder="SAVE10"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Notes (optional, max 2000)</Label>
              <Textarea
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value.slice(0, 2000))}
                rows={2}
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="bg-brand-gold hover:bg-brand-gold-dark text-white"
              onClick={handleCreateSubmit}
              disabled={
                createMutation.isPending ||
                !createUserId ||
                !createAddressId ||
                !lineItems.some((r) => r.productId && r.variantId)
              }
            >
              {createMutation.isPending ? "Creating…" : "Create order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
