"use client";

import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Plus,
  AlertTriangle,
  ShoppingCart,
  Loader2,
  RotateCcw,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAdminDashboard } from "@/hooks/use-dashboard";
import { formatBDT } from "@/lib/currency";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { data: res, isLoading, isError, error, refetch } = useAdminDashboard();
  const d = res?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Performance overview</h1>
          <p className="text-muted-foreground text-sm">
            Metrics from paid orders, inventory, returns, and customers (admin API).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Refresh
          </Button>
          <Link href="/dashboard/products/new">
            <Button className="bg-brand-gold hover:bg-brand-gold-dark text-white">
              <Plus className="mr-2 h-4 w-4" />
              New product
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="text-brand-gold h-10 w-10 animate-spin" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm">
            <p className="text-destructive font-medium">Could not load dashboard</p>
            <p className="text-muted-foreground mt-2">
              {(error as { message?: string })?.message ??
                "Check your connection and try again."}
            </p>
            <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : d ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <DollarSign className="text-muted-foreground h-5 w-5" />
                </div>
                <p className="text-muted-foreground mt-3 text-xs font-medium tracking-wider uppercase">
                  Total revenue (paid)
                </p>
                <p className="mt-1 text-2xl font-bold">{formatBDT(d.revenue.total)}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Today {formatBDT(d.revenue.today)} · This week{" "}
                  {formatBDT(d.revenue.week)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <ShoppingBag className="text-muted-foreground h-5 w-5" />
                </div>
                <p className="text-muted-foreground mt-3 text-xs font-medium tracking-wider uppercase">
                  Orders
                </p>
                <p className="mt-1 text-2xl font-bold">{d.orders.total}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {d.orders.pending} pending · {d.orders.confirmed} confirmed ·{" "}
                  {d.orders.shipped} shipped
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <RotateCcw className="text-muted-foreground h-5 w-5" />
                </div>
                <p className="text-muted-foreground mt-3 text-xs font-medium tracking-wider uppercase">
                  Returns & payments
                </p>
                <p className="mt-1 text-2xl font-bold">{d.returns.pending}</p>
                <p className="text-muted-foreground text-xs">Returns pending</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {d.returns.approved} approved · {d.payments.pendingReview} payments
                  awaiting review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <Users className="text-muted-foreground h-5 w-5" />
                </div>
                <p className="text-muted-foreground mt-3 text-xs font-medium tracking-wider uppercase">
                  Customers
                </p>
                <p className="mt-1 text-2xl font-bold">{d.customers.total}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {d.customers.newToday} new today
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Revenue (paid orders)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-muted-foreground text-xs uppercase">Today</p>
                    <p className="mt-1 text-xl font-semibold">
                      {formatBDT(d.revenue.today)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-muted-foreground text-xs uppercase">Last 7 days</p>
                    <p className="mt-1 text-xl font-semibold">
                      {formatBDT(d.revenue.week)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-muted-foreground text-xs uppercase">This month</p>
                    <p className="mt-1 text-xl font-semibold">
                      {formatBDT(d.revenue.month)}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-xs">
                  Revenue sums use orders with payment status{" "}
                  <span className="font-mono">PAID</span> only, per backend dashboard
                  service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Low stock
                  <Badge variant="secondary" className="ml-auto">
                    {d.inventory.outOfStock} out of stock
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {d.inventory.lowStock.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No low-stock variants in the list.
                  </p>
                ) : (
                  d.inventory.lowStock.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {item.sku} · {item.ageRange} · reorder ≤ {item.reorderLevel}
                        </p>
                        <p className="mt-1 text-xs font-medium text-amber-700">
                          {item.stock} in stock
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/products/${item.product.id}/edit`}
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                        aria-label="Edit product"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Link>
                    </div>
                  ))
                )}
                <Link
                  href="/dashboard/stock"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "inline-flex w-full justify-center"
                  )}
                >
                  Stock & inventory
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <CardTitle>Orders</CardTitle>
                <Link
                  href="/dashboard/orders"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View all orders
                </Link>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p>
                  The dashboard API does not return individual order rows. Open{" "}
                  <Link
                    href="/dashboard/orders"
                    className="text-primary font-medium underline"
                  >
                    Orders
                  </Link>{" "}
                  for search, filters, and updates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Top products (units sold)</CardTitle>
                <Package className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent className="space-y-3">
                {d.topProducts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No sales data yet.</p>
                ) : (
                  d.topProducts.map((item, index) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 rounded-lg border p-3"
                    >
                      <span className="bg-brand-gold/10 text-brand-gold flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.totalSold.toLocaleString()} units (all-time)
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/products/${item.productId}/edit`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        Edit
                      </Link>
                    </div>
                  ))
                )}
                <Link
                  href="/dashboard/products"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "inline-flex w-full justify-center"
                  )}
                >
                  All products
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Quick links
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/returns"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                Returns
              </Link>
              <Link
                href="/dashboard/orders"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                Orders
              </Link>
              <Link
                href="/dashboard/products"
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
              >
                Products
              </Link>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
