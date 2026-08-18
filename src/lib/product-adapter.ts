"use client";

import type { BackendProduct } from "@/services/products";
import type { Product, ProductColor, ProductSize } from "@/types";
import { PRODUCT_SIZES } from "@/config/constants";

const DEFAULT_COLOR: ProductColor = { name: "Default", hex: "#111827" };
const SIZE_TAG_PREFIX = "SIZE:";

function computeSalePrice(price: number, discount?: number | null) {
  if (discount == null) return undefined;
  if (Number.isNaN(discount) || discount <= 0) return undefined;
  const sale = price - (price * discount) / 100;
  return Number.isFinite(sale) ? sale : undefined;
}

function ageRangesFromProduct(p: BackendProduct): string[] {
  if (p.ageRange?.length) return p.ageRange;
  const fromVariants = p.variants?.map((v) => v.ageRange) ?? [];
  return [...new Set(fromVariants)];
}

function ageGroupFromAgeRanges(ageRanges?: string[] | null): Product["ageGroup"] {
  if (!ageRanges?.length) return "infant";
  const has = (v: string) => ageRanges.includes(v);
  if (has("ZERO_TO_SIX_MONTHS") || has("SIX_TO_TWELVE_MONTHS")) return "newborn";
  if (has("ONE_YEAR") || has("TWO_YEARS")) return "infant";
  return "toddler";
}

function sizesFromTags(tags: string[] | undefined): ProductSize[] {
  if (!tags?.length) return [...(PRODUCT_SIZES as unknown as ProductSize[])];
  const allowed = new Set(PRODUCT_SIZES as unknown as ProductSize[]);
  const parsed = tags
    .filter((t) => typeof t === "string" && t.startsWith(SIZE_TAG_PREFIX))
    .map((t) => t.slice(SIZE_TAG_PREFIX.length) as ProductSize)
    .filter((s) => allowed.has(s));
  return parsed.length ? parsed : [...(PRODUCT_SIZES as unknown as ProductSize[])];
}

export function backendProductToProduct(p: BackendProduct): Product {
  const salePrice = computeSalePrice(p.minPrice, p.discount);
  const isOrganic = p.tags?.some((t) => t.toLowerCase().includes("organic")) ?? false;
  const ageRangeList = ageRangesFromProduct(p);
  const stockTotal = p.variants?.reduce((s, v) => s + v.stock, 0) ?? p.stock ?? 0;

  return {
    id: p.id,
    name: p.name,
    slug: p.id, // backend doesn't provide slug yet
    description: p.description,
    price: p.minPrice,
    maxPrice: p.maxPrice,
    salePrice,
    sku: p.variants?.[0]?.sku ?? p.id.slice(0, 10),
    stock: stockTotal,
    lowStockAlert: 5,
    category: "essentials",
    images: (p.images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.altText ?? p.name,
      isPrimary: img.isPrimary,
    })),
    sizes: sizesFromTags(p.tags),
    colors: [DEFAULT_COLOR],
    gender: "unisex",
    ageGroup: ageGroupFromAgeRanges(ageRangeList),
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
