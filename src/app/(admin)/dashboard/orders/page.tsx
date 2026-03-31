"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ecommerce/pagination";
import { Download } from "lucide-react";

const ORDERS = [
  {
    id: "#BB-8921",
    customer: "Elena Hayes",
    initials: "EH",
    status: "delivered",
    date: "Oct 24, 2025",
    amount: "$124.50",
    items: 3,
  },
  {
    id: "#BB-8920",
    customer: "Julian Miller",
    initials: "JM",
    status: "processing",
    date: "Oct 24, 2025",
    amount: "$89.00",
    items: 2,
  },
  {
    id: "#BB-8919",
    customer: "Sarah Adams",
    initials: "SA",
    status: "delivered",
    date: "Oct 23, 2025",
    amount: "$240.00",
    items: 4,
  },
  {
    id: "#BB-8918",
    customer: "Michael Park",
    initials: "MP",
    status: "pending",
    date: "Oct 23, 2025",
    amount: "$67.00",
    items: 1,
  },
  {
    id: "#BB-8917",
    customer: "Lisa Chen",
    initials: "LC",
    status: "shipped",
    date: "Oct 22, 2025",
    amount: "$156.00",
    items: 3,
  },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Dashboard / Orders
          </p>
          <h1 className="font-heading text-3xl font-bold">Orders</h1>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="newest">
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="amount_desc">Highest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          <div className="text-muted-foreground grid grid-cols-[1fr_1fr_100px_120px_100px_80px_80px] items-center gap-4 border-b px-6 py-3 text-xs font-semibold tracking-wider uppercase">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Status</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
            <span>Actions</span>
          </div>
          {ORDERS.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-[1fr_1fr_100px_120px_100px_80px_80px] items-center gap-4 border-b px-6 py-4 last:border-b-0"
            >
              <span className="text-sm font-medium">{order.id}</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px]">
                    {order.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{order.customer}</span>
              </div>
              <span className="text-muted-foreground text-sm">{order.items} items</span>
              <Badge variant="secondary" className={STATUS_COLORS[order.status]}>
                {order.status}
              </Badge>
              <span className="text-muted-foreground text-sm">{order.date}</span>
              <span className="text-right text-sm font-medium">{order.amount}</span>
              <Button variant="ghost" size="sm" className="text-xs">
                View
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    </div>
  );
}
