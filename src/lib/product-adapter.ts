"use client";

import type { BackendProduct } from "@/services/products";
import type { Product, ProductColor, ProductSize } from "@/types";
import { PRODUCT_SIZES } from "@/config/constants";

const DEFAULT_COLOR: ProductColor = { name: "Default", hex: "#111827" };

function computeSalePrice(price: number, discount?: number | null) {
  if (discount == null) return undefined;
  if (Number.isNaN(discount) || discount <= 0) return undefined;
  const sale = price - (price * discount) / 100;
  return Number.isFinite(sale) ? sale : undefined;
}

function ageGroupFromAgeRange(ageRange?: string | null): Product["ageGroup"] {
  if (!ageRange) return "infant";
  if (ageRange === "ZERO_TO_SIX_MONTHS" || ageRange === "SIX_TO_TWELVE_MONTHS") {
    return "newborn";
  }
  if (ageRange === "ONE_YEAR" || ageRange === "TWO_YEARS") return "infant";
  return "toddler";
}

export function backendProductToProduct(p: BackendProduct): Product {
  const salePrice = computeSalePrice(p.price, p.discount);
  const isOrganic = p.tags?.some((t) => t.toLowerCase().includes("organic")) ?? false;

  return {
    id: p.id,
    name: p.name,
    slug: p.id, // backend doesn't provide slug yet
    description: p.description,
    price: p.price,
    salePrice,
    sku: p.id.slice(0, 10),
    stock: p.stock,
    lowStockAlert: 5,
    category: "essentials",
    images: (p.images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.altText ?? p.name,
      isPrimary: img.isPrimary,
    })),
    sizes: [...(PRODUCT_SIZES as unknown as ProductSize[])],
    colors: [DEFAULT_COLOR],
    gender: "unisex",
    ageGroup: ageGroupFromAgeRange(p.ageRange),
    tags: p.tags ?? [],
    rating: p.rating ?? 0,
    reviewCount: p.reviewsCount ?? 0,
    isFeatured: false,
    isOrganic,
    status: p.isActive ? "active" : "draft",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export const DEFAULT_CART_COLOR = DEFAULT_COLOR;
