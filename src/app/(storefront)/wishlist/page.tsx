"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { ArrowLeft, Heart, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "@/components/ecommerce/rating-stars";
import {
  applyDiscount,
  displayPrice,
  hasPriceRange,
  productService,
  totalVariantStock,
} from "@/services/products";
import type { BackendProduct } from "@/services/products";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { backendProductToProduct, DEFAULT_CART_COLOR } from "@/lib/product-adapter";
import { formatBDT } from "@/lib/currency";
import { AGE_RANGES } from "@/config/constants";
import type { ProductSize } from "@/types";

const DEFAULT_SIZE: ProductSize = "0-3M";

function ageRangeLabel(ageRanges: string[] | undefined): string | null {
  if (!ageRanges?.length) return null;
  const match = AGE_RANGES.find((a) => a.value === ageRanges[0]);
  const base = match?.label ?? ageRanges[0].replace(/_/g, " ");
  return ageRanges.length === 1 ? base : `${base} +${ageRanges.length - 1}`;
}

function formatAddedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);

  // The store is localStorage-backed, so it is empty during SSR and on the
  // first client render. Rendering the real list before that point produces a
  // hydration mismatch.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Newest first, and keep a stable order while queries resolve.
  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      ),
    [items]
  );

  // One query per product, sharing the ["product", id] cache with the product
  // detail page so navigating between the two does not refetch.
  const results = useQueries({
    queries: sortedItems.map((item) => ({
      queryKey: ["product", item.productId],
      queryFn: async () => {
        const res = await productService.getById(item.productId);
        return res.data;
      },
      retry: false,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);

  const entries = sortedItems.map((item, i) => ({
    item,
    product: results[i]?.data as BackendProduct | undefined,
    /** Product id is persisted forever, so it can outlive the product itself. */
    unavailable: results[i]?.isError ?? false,
  }));

  const available = entries.filter(
    (e): e is typeof e & { product: BackendProduct } =>
      e.product !== undefined && e.product.isActive
  );

  const inStock = available.filter(
    (e) => totalVariantStock(e.product) > 0 && e.product.variants?.[0]?.id
  );

  const handleAddToCart = (product: BackendProduct, alsoRemove: boolean) => {
    const variantId = product.variants?.[0]?.id;
    if (!variantId) {
      toast.error("This item has no purchasable variant yet.");
      return;
    }

    addToCart(
      backendProductToProduct(product),
      variantId,
      DEFAULT_SIZE,
      DEFAULT_CART_COLOR,
      1,
      applyDiscount(product.variants![0].price, product.discount)
    );

    if (alsoRemove) removeItem(product.id);
    toast.success(`${product.name} added to your basket`);
  };

  const handleMoveAll = () => {
    if (inStock.length === 0) return;

    inStock.forEach(({ product }) => {
      const variantId = product.variants?.[0]?.id;
      if (!variantId) return;
      addToCart(
        backendProductToProduct(product),
        variantId,
        DEFAULT_SIZE,
        DEFAULT_CART_COLOR,
        1,
        applyDiscount(product.variants![0].price, product.discount)
      );
      removeItem(product.id);
    });

    toast.success(
      `${inStock.length} ${inStock.length === 1 ? "item" : "items"} moved to your basket`
    );
  };

  const handleClearAll = () => {
    const count = sortedItems.length;
    sortedItems.forEach(({ productId }) => removeItem(productId));
    toast.success(
      `Removed ${count} ${count === 1 ? "item" : "items"} from your wishlist`
    );
  };

  // ─── Loading / hydration ────────────────────────────────────────────────────

  if (!hydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted mb-2 h-9 w-56 animate-pulse rounded" />
        <div className="bg-muted mb-8 h-5 w-72 animate-pulse rounded" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-80 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Empty ──────────────────────────────────────────────────────────────────

  if (sortedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading mb-2 text-3xl font-bold">Your Wishlist</h1>
        <p className="text-muted-foreground mb-8">
          Save the pieces you love and come back to them any time.
        </p>

        <div className="py-16 text-center">
          <Heart className="text-muted-foreground/40 mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-lg font-medium">
            Your wishlist is empty
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/shop"
            className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ─── List ───────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading mb-2 text-3xl font-bold">Your Wishlist</h1>
          <p className="text-muted-foreground">
            {sortedItems.length} {sortedItems.length === 1 ? "item" : "items"} saved
            {isLoading && (
              <Loader2 className="text-brand-gold ml-2 inline h-3.5 w-3.5 animate-spin" />
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleMoveAll}
            disabled={inStock.length === 0}
            className="bg-brand-olive hover:bg-brand-olive/90 text-white"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Move all to basket
            {inStock.length > 0 && ` (${inStock.length})`}
          </Button>
          <Button variant="outline" onClick={handleClearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear wishlist
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(({ item, product, unavailable }) => {
          // Product was deleted or the fetch failed — offer a way to clean it up
          // rather than rendering a permanently blank card.
          if (unavailable) {
            return (
              <Card key={item.productId} className="border-dashed">
                <CardContent className="flex h-full flex-col items-start justify-center gap-3 p-6">
                  <Badge variant="secondary">No longer available</Badge>
                  <p className="text-muted-foreground text-sm">
                    This product has been removed from the store.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            );
          }

          if (!product) {
            return (
              <div
                key={item.productId}
                className="bg-muted h-80 animate-pulse rounded-xl"
              />
            );
          }

          const primaryImage =
            product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
          const hasDiscount = product.discount != null && product.discount > 0;
          const basePrice = displayPrice(product);
          const salePrice = hasDiscount
            ? applyDiscount(basePrice, product.discount)
            : null;
          const showsFrom = hasPriceRange(product);
          const stock = totalVariantStock(product);
          const purchasable =
            stock > 0 && !!product.variants?.[0]?.id && product.isActive;
          const ageBadge = ageRangeLabel(product.ageRange);
          const addedAt = formatAddedAt(item.addedAt);

          return (
            <Card
              key={item.productId}
              className="group bg-card overflow-hidden border transition-shadow hover:shadow-lg"
            >
              <Link href={`/product/${product.id}`}>
                <div className="bg-muted relative aspect-square overflow-hidden">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.altText ?? product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      No Image
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(product.id);
                      toast.success(`${product.name} removed from your wishlist`);
                    }}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm transition-all hover:bg-white"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>

                  <div className="absolute bottom-2 left-2 flex gap-1.5">
                    {hasDiscount && (
                      <Badge className="bg-red-500 text-xs text-white">
                        {Math.round(product.discount!)}% OFF
                      </Badge>
                    )}
                    {!product.isActive ? (
                      <Badge variant="secondary" className="text-xs">
                        Unavailable
                      </Badge>
                    ) : (
                      stock === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Out of Stock
                        </Badge>
                      )
                    )}
                  </div>

                  {ageBadge && (
                    <div className="absolute right-2 bottom-2">
                      <span className="text-foreground rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium">
                        {ageBadge}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <RatingStars rating={product.rating ?? 0} size="sm" showCount={false} />
                  {(product.rating ?? 0) > 0 && (
                    <span className="text-muted-foreground text-xs">
                      {product.rating}
                    </span>
                  )}
                </div>

                <Link href={`/product/${product.id}`}>
                  <h3 className="hover:text-primary line-clamp-1 text-sm font-medium transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {product.category && (
                  <p className="text-muted-foreground text-xs">{product.category.name}</p>
                )}

                <div className="flex items-center gap-2">
                  {showsFrom && (
                    <span className="text-muted-foreground text-xs">from</span>
                  )}
                  <span className="text-sm font-semibold">
                    {formatBDT(salePrice ?? basePrice)}
                  </span>
                  {salePrice && (
                    <span className="text-muted-foreground text-sm line-through">
                      {formatBDT(basePrice)}
                    </span>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  {addedAt && (
                    <span className="text-muted-foreground text-xs">Saved {addedAt}</span>
                  )}
                  {stock > 0 && stock <= 5 && (
                    <span className="text-xs font-medium text-amber-600">
                      Only {stock} left
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    className="bg-brand-olive hover:bg-brand-olive/90 flex-1 text-white"
                    disabled={!purchasable}
                    onClick={() => handleAddToCart(product, true)}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {purchasable ? "Move to Basket" : "Unavailable"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Remove ${product.name} from wishlist`}
                    onClick={() => {
                      removeItem(product.id);
                      toast.success(`${product.name} removed from your wishlist`);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/shop"
          className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
