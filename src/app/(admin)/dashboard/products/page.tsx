"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCategories } from "@/hooks/use-categories";
import { useDeleteProduct, useProducts, useUpdateProduct } from "@/hooks/use-products";
import { cn } from "@/lib/utils";
import { totalVariantStock, type BackendProduct } from "@/services/products";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  onesies: "bg-pink-100 text-pink-700",
  sleepwear: "bg-indigo-100 text-indigo-700",
  sets: "bg-emerald-100 text-emerald-700",
  accessories: "bg-purple-100 text-purple-700",
  outerwear: "bg-blue-100 text-blue-700",
  essentials: "bg-amber-100 text-amber-700",
};

export default function ProductManagementPage() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");
  const [sortBy, setSortBy] = useState<"createdAt" | "price" | "name">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<BackendProduct | null>(null);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];

  const { data, isLoading } = useProducts({
    page,
    limit: 10,
    sortBy,
    sortOrder,
    ...(categoryFilter !== "all" ? { categoryId: categoryFilter } : {}),
    ...(statusFilter === "inactive" ? { isActive: false } : {}),
  });

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const toggleActive = (product: BackendProduct) => {
    updateMutation.mutate({
      id: product.id,
      data: { isActive: !product.isActive },
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const bulkDelete = () => {
    selected.forEach((id) => deleteMutation.mutate(id));
    setSelected(new Set());
  };

  const handleSort = (val: string | null) => {
    if (!val) return;
    if (val === "newest") {
      setSortBy("createdAt");
      setSortOrder("desc");
    } else if (val === "price_asc") {
      setSortBy("price");
      setSortOrder("asc");
    } else if (val === "price_desc") {
      setSortBy("price");
      setSortOrder("desc");
    } else if (val === "name_asc") {
      setSortBy("name");
      setSortOrder("asc");
    } else if (val === "name_desc") {
      setSortBy("name");
      setSortOrder("desc");
    }
  };

  const getCategoryLabel = (product: BackendProduct) => {
    if (product.category) return product.category.name;
    const cat = categories.find((c) => c.id === product.categoryId);
    return cat?.name ?? "—";
  };

  const getCategorySlug = (product: BackendProduct) => {
    if (product.category?.slug) return product.category.slug;
    const cat = categories.find((c) => c.id === product.categoryId);
    return cat?.slug ?? "";
  };

  const getPrimaryImage = (product: BackendProduct) => {
    const primary = product.images?.find((i) => i.isPrimary);
    return primary?.url ?? product.images?.[0]?.url;
  };

  const pageNumbers = () => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    const current = pagination.page;
    const pages: (number | "...")[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Dashboard / Products
          </p>
          <h1 className="font-heading text-3xl font-bold">Products</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/products/new">
            <Button className="bg-brand-gold hover:bg-brand-gold-dark text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Category
          </span>
          <Select
            value={categoryFilter}
            onValueChange={(val) => val && setCategoryFilter(val)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Status
          </span>
          <Select
            value={statusFilter}
            onValueChange={(val) => val && setStatusFilter(val)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active listings</SelectItem>
              <SelectItem value="inactive">Inactive / hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Sort By
          </span>
          <Select
            value={
              sortBy === "createdAt" && sortOrder === "desc"
                ? "newest"
                : sortBy === "price" && sortOrder === "asc"
                  ? "price_asc"
                  : sortBy === "price"
                    ? "price_desc"
                    : sortBy === "name" && sortOrder === "asc"
                      ? "name_asc"
                      : sortBy === "name"
                        ? "name_desc"
                        : "newest"
            }
            onValueChange={handleSort}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
              <SelectItem value="name_asc">Name: A → Z</SelectItem>
              <SelectItem value="name_desc">Name: Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="selectAll"
              checked={products.length > 0 && selected.size === products.length}
              onCheckedChange={toggleSelectAll}
            />
            <label htmlFor="selectAll" className="text-sm">
              Select All
            </label>
          </div>
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={bulkDelete}>
              <Trash2 className="mr-1 h-3 w-3" />
              Bulk Delete
            </Button>
          )}
        </div>
      </div>

      {/* Product table */}
      <div className="bg-card rounded-lg border">
        {/* Table header */}
        <div className="text-muted-foreground grid grid-cols-[40px_1fr_100px_110px_80px_70px_60px_80px] items-center gap-4 border-b px-4 py-3 text-xs font-semibold tracking-wider uppercase">
          <span />
          <span>Product</span>
          <span>SKU</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-muted-foreground py-20 text-center">
            No products found.
          </div>
        ) : (
          products.map((product) => {
            const imgUrl = getPrimaryImage(product);
            const catLabel = getCategoryLabel(product);
            const catSlug = getCategorySlug(product) ?? "";
            const stockTotal = totalVariantStock(product);
            const lowStock = stockTotal > 0 && stockTotal <= 5;
            const primarySku =
              product.variants?.length === 1
                ? (product.variants[0]?.sku ?? "—")
                : product.variants && product.variants.length > 1
                  ? "Multiple"
                  : "—";

            return (
              <div
                key={product.id}
                className="grid grid-cols-[40px_1fr_100px_110px_80px_70px_60px_80px] items-center gap-4 border-b px-4 py-4 last:border-b-0"
              >
                <Checkbox
                  checked={selected.has(product.id)}
                  onCheckedChange={() => toggleSelect(product.id)}
                />
                <div className="flex items-center gap-3">
                  {imgUrl ? (
                    <div className="bg-muted relative h-10 w-10 overflow-hidden rounded-lg">
                      <Image
                        src={imgUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted h-10 w-10 rounded-lg" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {product.description.slice(0, 40)}
                      {product.description.length > 40 ? "..." : ""}
                    </p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs" title={primarySku}>
                  {primarySku}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    CATEGORY_COLORS[catSlug] ?? "bg-gray-100 text-gray-700"
                  )}
                >
                  {catLabel}
                </Badge>
                <span className="text-sm font-medium">৳{product.price.toFixed(2)}</span>
                <div>
                  <span className="text-sm">{stockTotal}</span>
                  {lowStock && (
                    <p className="text-[10px] font-semibold text-red-500">Low Stock</p>
                  )}
                  {stockTotal === 0 && (
                    <p className="text-[10px] font-semibold text-red-500">Out of Stock</p>
                  )}
                </div>
                <button
                  onClick={() => toggleActive(product)}
                  className="flex items-center"
                >
                  <div
                    className={cn(
                      "h-5 w-9 rounded-full transition-colors",
                      product.isActive ? "bg-brand-gold" : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                        product.isActive ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => setDeleteTarget(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} products
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {pageNumbers().map((n, i) =>
              n === "..." ? (
                <span key={`dots-${i}`} className="text-muted-foreground px-1">
                  ...
                </span>
              ) : (
                <Button
                  key={n}
                  variant={n === pagination.page ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-xs",
                    n === pagination.page &&
                      "bg-brand-gold hover:bg-brand-gold-dark text-white"
                  )}
                  onClick={() => setPage(n)}
                >
                  {n}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-muted-foreground py-4 text-center text-xs tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Baby Bliss Boutique | Global Product Registry
      </div>

      {/* ────── Delete Confirmation Dialog ────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Delete Product</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete{" "}
              <span className="text-foreground font-semibold">
                &ldquo;{deleteTarget?.name}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
