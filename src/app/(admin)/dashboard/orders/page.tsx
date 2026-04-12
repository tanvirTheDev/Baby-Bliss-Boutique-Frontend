"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Eye,
  Loader2,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ecommerce/pagination";
import {
  useOrders,
  useOrder,
  useAdminCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
} from "@/hooks/use-orders";
import { useUsers } from "@/hooks/use-users";
import { useUserShippingAddresses } from "@/hooks/use-shipping-addresses";
import { useProducts } from "@/hooks/use-products";
import type { Order, OrderStatus, PaymentStatus } from "@/services/orders";
import { formatBDT } from "@/lib/currency";
import { cn } from "@/lib/utils";

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
  const [editNotes, setEditNotes] = useState("");

  const createMutation = useAdminCreateOrder();
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();

  const { data: usersRes } = useUsers({ role: "CUSTOMER", limit: 100, page: 1 });
  const customers = usersRes?.data ?? [];

  const [createUserId, setCreateUserId] = useState("");
  const { data: addresses = [] } = useUserShippingAddresses(createUserId);
  const [createAddressId, setCreateAddressId] = useState("");
  const [createCoupon, setCreateCoupon] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: string }[]>([
    { productId: "", quantity: "1" },
  ]);

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
    setEditNotes(o.notes ?? "");
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
    setLineItems([{ productId: "", quantity: "1" }]);
    setModalMode("create");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveId(null);
  };

  const handleSaveEdit = () => {
    if (!activeId) return;
    updateMutation.mutate(
      {
        id: activeId,
        data: {
          status: editStatus,
          paymentStatus: editPayment,
          notes: editNotes.trim() || null,
        },
      },
      { onSuccess: closeModal }
    );
  };

  const handleDelete = () => {
    if (!activeId) return;
    deleteMutation.mutate(activeId, { onSuccess: closeModal });
  };

  const addLine = () => {
    setLineItems((rows) => [...rows, { productId: "", quantity: "1" }]);
  };

  const setLine = (
    i: number,
    patch: Partial<{ productId: string; quantity: string }>
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
        quantity: Math.max(1, parseInt(r.quantity, 10) || 0),
      }))
      .filter((r) => r.productId);
    if (!createUserId || !createAddressId || items.length === 0) return;
    createMutation.mutate(
      {
        userId: createUserId,
        shippingAddressId: createAddressId,
        items,
        ...(createCoupon.trim() ? { couponCode: createCoupon.trim().toUpperCase() } : {}),
        ...(createNotes.trim() ? { notes: createNotes.trim() } : {}),
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
            <SelectItem value="PAID">Paid</SelectItem>
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
                <Badge
                  variant="outline"
                  className={cn("w-fit uppercase", PAYMENT_STYLES[o.paymentStatus])}
                >
                  {o.paymentStatus}
                </Badge>
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
            <DialogDescription>Change fulfillment and payment state.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase">Order status</Label>
              <Select
                value={editStatus}
                onValueChange={(v) => setEditStatus((v ?? "PENDING") as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Payment status</Label>
              <Select
                value={editPayment}
                onValueChange={(v) => setEditPayment((v ?? "UNPAID") as PaymentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Internal notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="bg-brand-gold hover:bg-brand-gold-dark text-white"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
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
                  setCreateAddressId(val === "__none__" ? "" : val);
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
                          setLine(i, { productId: val === "__none__" ? "" : val });
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
              <Label className="text-xs uppercase">Notes (optional)</Label>
              <Textarea
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                rows={2}
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
                !lineItems.some((r) => r.productId)
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
