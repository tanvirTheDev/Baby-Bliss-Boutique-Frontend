"use client";

import Link from "next/link";
import { Plus, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ecommerce/pagination";

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Rose Petal Tulle Dress",
    subtitle: "Hand-stitched silk lining",
    sku: "BB-DR-001",
    category: "Girls",
    categoryColor: "bg-pink-100 text-pink-700",
    price: "$48.00",
    stock: 12,
    status: true,
  },
  {
    id: "2",
    name: "Cashmere Heirloom Cardigan",
    subtitle: "100% Mongolian Cashmere",
    sku: "BB-KN-042",
    category: "Boys",
    categoryColor: "bg-blue-100 text-blue-700",
    price: "$85.00",
    stock: 2,
    lowStock: true,
    status: true,
  },
  {
    id: "3",
    name: "Wooden Teething Set",
    subtitle: "Organic Maple & Beech",
    sku: "BB-TY-119",
    category: "Gifts",
    categoryColor: "bg-purple-100 text-purple-700",
    price: "$32.00",
    stock: 0,
    status: false,
  },
  {
    id: "4",
    name: "Botanical Swaddle Bundle",
    subtitle: "Pre-washed 2-pack muslin",
    sku: "BB-SW-088",
    category: "Newborn",
    categoryColor: "bg-green-100 text-green-700",
    price: "$54.00",
    stock: 45,
    status: true,
  },
];

export default function ProductManagementPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="girls">Girls</SelectItem>
            <SelectItem value="boys">Boys</SelectItem>
            <SelectItem value="newborn">Newborn</SelectItem>
            <SelectItem value="gifts">Gifts</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="newest">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="selectAll" />
            <label htmlFor="selectAll" className="text-sm">
              Select All
            </label>
          </div>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-1 h-3 w-3" />
            Bulk Delete
          </Button>
        </div>
      </div>

      {/* Product table */}
      <div className="bg-card rounded-lg border">
        <div className="text-muted-foreground grid grid-cols-[auto_1fr_100px_100px_80px_60px_60px_80px] items-center gap-4 border-b px-4 py-3 text-xs font-semibold tracking-wider uppercase">
          <span />
          <span>Product</span>
          <span>SKU</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {MOCK_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-[auto_1fr_100px_100px_80px_60px_60px_80px] items-center gap-4 border-b px-4 py-4 last:border-b-0"
          >
            <Checkbox />
            <div className="flex items-center gap-3">
              <div className="bg-muted h-10 w-10 rounded-lg" />
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-muted-foreground text-xs">{product.subtitle}</p>
              </div>
            </div>
            <span className="text-muted-foreground text-xs">{product.sku}</span>
            <Badge variant="secondary" className={product.categoryColor}>
              {product.category}
            </Badge>
            <span className="text-sm font-medium">{product.price}</span>
            <div>
              <span className="text-sm">{product.stock}</span>
              {product.lowStock && <p className="text-[10px] text-red-500">Low Stock</p>}
              {product.stock === 0 && (
                <p className="text-[10px] text-red-500">Out of Stock</p>
              )}
            </div>
            <div className="flex items-center">
              <div
                className={`h-5 w-9 rounded-full transition-colors ${product.status ? "bg-brand-gold" : "bg-muted"}`}
              >
                <div
                  className={`mt-0.5 h-4 w-4 rounded-full bg-white transition-transform ${product.status ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              Edit
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs tracking-wider uppercase">
          Showing 1-10 of 124 products
        </p>
        <Pagination currentPage={1} totalPages={13} onPageChange={() => {}} />
      </div>
    </div>
  );
}
