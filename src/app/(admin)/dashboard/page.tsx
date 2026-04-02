"use client";

import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  AlertTriangle,
  Download,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

const STATS = [
  {
    label: "Total Revenue",
    value: "৳42,850.00",
    change: "+12.5%",
    positive: true,
    icon: DollarSign,
  },
  {
    label: "Total Orders",
    value: "1,284",
    change: "+8.2%",
    positive: true,
    icon: ShoppingBag,
    subtitle: "156 orders pending processing",
  },
  {
    label: "Total Products",
    value: "452",
    change: "Static",
    positive: null,
    icon: Package,
    subtitle: "12 new arrivals this week",
  },
  {
    label: "Active Customers",
    value: "8,922",
    change: "-2.4%",
    positive: false,
    icon: Users,
    subtitle: "Focus on retention campaigns",
  },
];

const RECENT_ORDERS = [
  {
    id: "#BB-8921",
    customer: "Elena Hayes",
    initials: "EH",
    status: "delivered",
    date: "Oct 24, 2025",
    amount: "৳124.50",
  },
  {
    id: "#BB-8920",
    customer: "Julian Miller",
    initials: "JM",
    status: "processing",
    date: "Oct 24, 2025",
    amount: "৳89.00",
  },
  {
    id: "#BB-8919",
    customer: "Sarah Adams",
    initials: "SA",
    status: "delivered",
    date: "Oct 23, 2025",
    amount: "৳240.00",
  },
];

const LOW_STOCK = [
  { name: "Organic Cotton Onesie", remaining: 2 },
  { name: "Wooden Safari Rattle", remaining: 5 },
];

const TOP_SELLING = [
  { rank: 1, name: "Bamboo Swaddle", sold: "1,240 sold", revenue: "৳3,420" },
  { rank: 2, name: "Sleepy Sheep Lamp", sold: "890 sold", revenue: "৳2,890" },
  { rank: 3, name: "Knitted Baby Cap", sold: "650 sold", revenue: "৳1,450" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Performance Overview</h1>
          <p className="text-muted-foreground text-sm">
            Real-time boutique metrics for today.
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="bg-brand-gold hover:bg-brand-gold-dark text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <stat.icon className="text-muted-foreground h-5 w-5" />
                </div>
                {stat.positive !== null && (
                  <Badge
                    variant="secondary"
                    className={
                      stat.positive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {stat.positive ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {stat.change}
                  </Badge>
                )}
                {stat.positive === null && (
                  <Badge variant="secondary">{stat.change}</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-3 text-xs font-medium tracking-wider uppercase">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-muted-foreground mt-1 text-xs">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Revenue Trends placeholder */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex h-64 items-center justify-center">
              Chart placeholder — integrate with recharts
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {LOW_STOCK.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted h-10 w-10 rounded-lg" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-red-500">{item.remaining} items left</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="link" className="text-primary text-sm">
              <Download className="mr-1 h-3 w-3" />
              Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-muted-foreground grid grid-cols-5 gap-2 text-xs font-semibold tracking-wider uppercase">
                <span>Order ID</span>
                <span>Customer</span>
                <span>Status</span>
                <span>Date</span>
                <span className="text-right">Amount</span>
              </div>
              {RECENT_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-5 items-center gap-2 rounded-lg py-3 text-sm"
                >
                  <span className="font-medium">{order.id}</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">
                        {order.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{order.customer}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  >
                    {order.status}
                  </Badge>
                  <span className="text-muted-foreground">{order.date}</span>
                  <span className="text-right font-medium">{order.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TOP_SELLING.map((item) => (
              <div
                key={item.rank}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                <span className="bg-brand-gold/10 text-brand-gold flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
                  {String(item.rank).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs">{item.sold}</p>
                </div>
                <p className="text-brand-gold font-semibold">{item.revenue}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Full Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
