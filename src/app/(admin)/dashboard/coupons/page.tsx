"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Percent,
  Plus,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useToggleCoupon,
  useUpdateCoupon,
} from "@/hooks/use-coupons";
import { useProducts } from "@/hooks/use-products";
import type {
  Coupon,
  CreateCouponBody,
  DiscountType,
  UpdateCouponBody,
} from "@/services/coupons";
import { formatBDT } from "@/lib/currency";
import { cn } from "@/lib/utils";

type ModalMode = "create" | "edit" | "delete" | null;

function formatDiscount(c: Coupon): string {
  if (c.discountType === "PERCENTAGE") {
    const cap = c.maximumDiscount != null ? ` (max ${formatBDT(c.maximumDiscount)})` : "";
    return `${c.discountValue}%${cap}`;
  }
  return formatBDT(c.discountValue);
}

export default function CouponsAdminPage() {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    "createdAt" | "expiresAt" | "usedCount" | "discountValue"
  >("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | DiscountType>("all");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [maximumDiscount, setMaximumDiscount] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [restrictProducts, setRestrictProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    () => new Set()
  );

  const listParams = useMemo(
    () => ({
      page,
      limit: 10,
      sortBy,
      sortDir,
      ...(statusFilter === "active" ? { isActive: true } : {}),
      ...(statusFilter === "inactive" ? { isActive: false } : {}),
      ...(typeFilter !== "all" ? { discountType: typeFilter } : {}),
    }),
    [page, sortBy, sortDir, statusFilter, typeFilter]
  );

  const { data: listRes, isLoading } = useCoupons(listParams);
  const coupons = listRes?.data ?? [];
  const pagination = listRes?.pagination;

  const { data: productsRes } = useProducts({ page: 1, limit: 100, sortBy: "createdAt" });
  const products = productsRes?.data ?? [];

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();
  const toggleMutation = useToggleCoupon();

  const resetForm = () => {
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setMaximumDiscount("");
    setMinimumOrderAmount("");
    setUsageLimit("");
    setPerUserLimit("1");
    setIsActive(true);
    setExpiresAt("");
    setRestrictProducts(false);
    setSelectedProductIds(new Set());
    setProductSearch("");
  };

  const openCreate = () => {
    resetForm();
    setActiveCoupon(null);
    setModalMode("create");
  };

  const openEdit = (c: Coupon) => {
    setActiveCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(String(c.discountValue));
    setMaximumDiscount(c.maximumDiscount != null ? String(c.maximumDiscount) : "");
    setMinimumOrderAmount(
      c.minimumOrderAmount != null ? String(c.minimumOrderAmount) : ""
    );
    setUsageLimit(c.usageLimit != null ? String(c.usageLimit) : "");
    setPerUserLimit(String(c.perUserLimit));
    setIsActive(c.isActive);
    setExpiresAt(c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "");
    const ids = new Set((c.applicableProducts ?? []).map((ap) => ap.product.id));
    setSelectedProductIds(ids);
    setRestrictProducts(ids.size > 0);
    setProductSearch("");
    setModalMode("edit");
  };

  const openDelete = (c: Coupon) => {
    setActiveCoupon(c);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveCoupon(null);
  };

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  function buildCreatePayload(): CreateCouponBody {
    const dv = Number(discountValue);
    const perUser = Number(perUserLimit) || 1;
    const productIds =
      restrictProducts && selectedProductIds.size > 0
        ? [...selectedProductIds]
        : restrictProducts
          ? []
          : undefined;

    const body: CreateCouponBody = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: dv,
      perUserLimit: perUser,
      isActive,
    };

    if (discountType === "PERCENTAGE" && maximumDiscount.trim()) {
      body.maximumDiscount = Number(maximumDiscount);
    }
    if (minimumOrderAmount.trim()) {
      body.minimumOrderAmount = Number(minimumOrderAmount);
    }
    if (usageLimit.trim()) {
      body.usageLimit = Number(usageLimit);
    }
    if (expiresAt.trim()) {
      body.expiresAt = new Date(expiresAt).toISOString();
    }
    if (productIds && productIds.length > 0) {
      body.productIds = productIds;
    }
    return body;
  }

  function buildUpdatePayload(): UpdateCouponBody {
    const dv = Number(discountValue);
    const perUser = Number(perUserLimit) || 1;
    const productIds = restrictProducts ? [...selectedProductIds] : [];

    const body: UpdateCouponBody = {
      discountType,
      discountValue: dv,
      perUserLimit: perUser,
      isActive,
      productIds,
    };

    if (discountType === "PERCENTAGE" && maximumDiscount.trim()) {
      body.maximumDiscount = Number(maximumDiscount);
    }
    if (minimumOrderAmount.trim()) {
      body.minimumOrderAmount = Number(minimumOrderAmount);
    }
    if (usageLimit.trim()) {
      body.usageLimit = Number(usageLimit);
    }
    if (expiresAt.trim()) {
      body.expiresAt = new Date(expiresAt).toISOString();
    }
    return body;
  }

  const handleCreate = () => {
    if (code.trim().length < 3) return;
    const dv = Number(discountValue);
    if (!Number.isFinite(dv) || dv <= 0) return;
    createMutation.mutate(buildCreatePayload(), { onSuccess: closeModal });
  };

  const handleUpdate = () => {
    if (!activeCoupon) return;
    const dv = Number(discountValue);
    if (!Number.isFinite(dv) || dv <= 0) return;
    updateMutation.mutate(
      {
        id: activeCoupon.id,
        data: buildUpdatePayload(),
      },
      { onSuccess: closeModal }
    );
  };

  const handleDelete = () => {
    if (!activeCoupon) return;
    deleteMutation.mutate(activeCoupon.id, { onSuccess: closeModal });
  };

  const toggleCoupon = (c: Coupon) => {
    toggleMutation.mutate(c.id);
  };

  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Dashboard / Coupons
          </p>
          <h1 className="font-heading text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and manage discount codes for checkout.
          </p>
        </div>
        <Button
          className="bg-brand-gold hover:bg-brand-gold-dark text-white"
          onClick={openCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          New coupon
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <TicketPercent className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pagination?.total ?? "—"}</p>
              <p className="text-muted-foreground text-xs">Total coupons</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Percent className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-muted-foreground text-xs">On this page</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-muted-foreground text-xs uppercase">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as typeof statusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Label className="text-muted-foreground text-xs uppercase">Type</Label>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v as typeof typeFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Sort
          </span>
          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v as typeof sortBy);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created</SelectItem>
              <SelectItem value="expiresAt">Expires</SelectItem>
              <SelectItem value="usedCount">Times used</SelectItem>
              <SelectItem value="discountValue">Discount value</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortDir}
            onValueChange={(v) => {
              setSortDir(v as typeof sortDir);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-muted-foreground grid grid-cols-[minmax(0,1.2fr)_100px_minmax(0,1fr)_minmax(0,1fr)_80px_100px] items-center gap-3 border-b px-4 py-3 text-xs font-semibold tracking-wider uppercase max-lg:hidden">
          <span>Code</span>
          <span>Type</span>
          <span>Discount</span>
          <span>Usage / limits</span>
          <span className="text-center">Active</span>
          <span className="text-center">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <TicketPercent className="text-muted-foreground/40 h-12 w-12" />
            <p className="text-muted-foreground">No coupons match your filters.</p>
            <Button variant="outline" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create a coupon
            </Button>
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-1 gap-3 border-b px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.2fr)_100px_minmax(0,1fr)_minmax(0,1fr)_80px_100px] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{c.code}</span>
                  {c.applicableProducts && c.applicableProducts.length > 0 ? (
                    <Badge variant="outline" className="text-[10px]">
                      {c.applicableProducts.length} product(s)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Storewide
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {c.minimumOrderAmount != null
                    ? `Min. order ${formatBDT(c.minimumOrderAmount)}`
                    : "No minimum order"}
                  {c.expiresAt
                    ? ` · Exp. ${new Date(c.expiresAt).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              <Badge variant="secondary" className="w-fit">
                {c.discountType === "PERCENTAGE" ? "%" : "৳"}
              </Badge>
              <p className="text-sm font-medium">{formatDiscount(c)}</p>
              <p className="text-muted-foreground text-sm">
                {c.usedCount} used
                {c.usageLimit != null ? ` / ${c.usageLimit} max` : " / ∞ max"}
                {" · "}
                {c.perUserLimit} per user
              </p>
              <div className="flex justify-start lg:justify-center">
                <button
                  type="button"
                  onClick={() => toggleCoupon(c)}
                  disabled={toggleMutation.isPending}
                  className="flex items-center"
                >
                  <div
                    className={cn(
                      "h-5 w-9 rounded-full transition-colors",
                      c.isActive ? "bg-brand-gold" : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                        c.isActive ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </button>
              </div>
              <div className="flex items-center justify-start gap-1 lg:justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => openDelete(c)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-muted-foreground text-xs">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="text-muted-foreground py-4 text-center text-xs tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Baby Bliss Boutique | Coupons
      </div>

      <Dialog
        open={modalMode === "create" || modalMode === "edit"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Create coupon" : "Edit coupon"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Codes are stored in uppercase. Customers enter them at checkout."
                : `Editing ${activeCoupon?.code} — the code cannot be changed.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {modalMode === "create" && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase">Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME10"
                  className="font-mono"
                  maxLength={32}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase">Discount type</Label>
                <Select
                  value={discountType}
                  onValueChange={(v) => setDiscountType(v as DiscountType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed (BDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase">
                  {discountType === "PERCENTAGE" ? "Percent off" : "Amount (BDT)"}
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={discountType === "PERCENTAGE" ? 1 : 0.01}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "PERCENTAGE" ? "10" : "500"}
                />
              </div>
            </div>

            {discountType === "PERCENTAGE" && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase">
                  Max discount (BDT)
                  <span className="text-muted-foreground ml-1 font-normal normal-case">
                    optional cap
                  </span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={maximumDiscount}
                  onChange={(e) => setMaximumDiscount(e.target.value)}
                  placeholder="e.g. 2000"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase">
                  Min. order (BDT)
                  <span className="text-muted-foreground ml-1 font-normal normal-case">
                    optional
                  </span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase">
                  Total uses
                  <span className="text-muted-foreground ml-1 font-normal normal-case">
                    optional
                  </span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase">Per customer</Label>
              <Input
                type="number"
                min={1}
                step={1}
                value={perUserLimit}
                onChange={(e) => setPerUserLimit(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase">
                Expires
                <span className="text-muted-foreground ml-1 font-normal normal-case">
                  optional, must be in the future when set
                </span>
              </Label>
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="coupon-active"
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v === true)}
              />
              <Label htmlFor="coupon-active" className="text-sm font-normal">
                Coupon is active
              </Label>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="restrict-products"
                  checked={restrictProducts}
                  onCheckedChange={(v) => setRestrictProducts(v === true)}
                />
                <Label htmlFor="restrict-products" className="text-sm font-normal">
                  Limit to specific products
                </Label>
              </div>
              {restrictProducts && (
                <>
                  <Input
                    placeholder="Search products…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="text-sm"
                  />
                  <ScrollArea className="h-40 rounded-md border p-2">
                    <div className="space-y-2 pr-3">
                      {filteredProducts.length === 0 ? (
                        <p className="text-muted-foreground text-xs">
                          No products found.
                        </p>
                      ) : (
                        filteredProducts.map((p) => (
                          <div key={p.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`p-${p.id}`}
                              checked={selectedProductIds.has(p.id)}
                              onCheckedChange={() => toggleProduct(p.id)}
                            />
                            <Label
                              htmlFor={`p-${p.id}`}
                              className="line-clamp-2 flex-1 cursor-pointer text-sm font-normal"
                            >
                              {p.name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="bg-brand-gold hover:bg-brand-gold-dark text-white"
              onClick={modalMode === "create" ? handleCreate : handleUpdate}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !discountValue.trim() ||
                (modalMode === "create" && code.trim().length < 3)
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving…"
                : modalMode === "create"
                  ? "Create"
                  : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalMode === "delete"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Delete coupon</DialogTitle>
            <DialogDescription className="text-center">
              Remove{" "}
              <span className="text-foreground font-mono font-semibold">
                {activeCoupon?.code}
              </span>
              ? This cannot be undone. Orders that already used it are unchanged.
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
    </div>
  );
}
