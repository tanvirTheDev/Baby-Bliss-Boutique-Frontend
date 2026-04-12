"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "./wishlist-button";
import { RatingStars } from "./rating-stars";
import type { BackendProduct } from "@/services/products";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { backendProductToProduct, DEFAULT_CART_COLOR } from "@/lib/product-adapter";
import { formatBDT } from "@/lib/currency";
import { AGE_RANGES } from "@/config/constants";

function ageRangeBadgeLabel(ageRanges: string[] | undefined): string | null {
  if (!ageRanges?.length) return null;
  const first = AGE_RANGES.find((a) => a.value === ageRanges[0]);
  const base = first?.label ?? ageRanges[0].replace(/_/g, " ");
  if (ageRanges.length === 1) return base;
  return `${base} +${ageRanges.length - 1}`;
}

interface StorefrontProductCardProps {
  product: BackendProduct;
  className?: string;
}

export function StorefrontProductCard({
  product,
  className,
}: StorefrontProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const primaryImage =
    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const hasDiscount = product.discount != null && product.discount > 0;
  const salePrice = hasDiscount
    ? product.price - (product.price * product.discount!) / 100
    : null;
  const ageBadge = ageRangeBadgeLabel(product.ageRange);

  return (
    <Card
      className={cn(
        "group bg-card overflow-hidden border transition-shadow hover:shadow-lg",
        className
      )}
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

          <WishlistButton productId={product.id} variant="overlay" />

          <div className="absolute bottom-2 left-2 flex gap-1.5">
            {hasDiscount && (
              <Badge className="bg-red-500 text-xs text-white">
                {Math.round(product.discount!)}% OFF
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
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
            <span className="text-muted-foreground text-xs">{product.rating}</span>
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
          <span className="text-sm font-semibold">
            {formatBDT(salePrice ?? product.price)}
          </span>
          {salePrice && (
            <span className="text-muted-foreground text-sm line-through">
              {formatBDT(product.price)}
            </span>
          )}
        </div>

        <Button
          className="bg-brand-olive hover:bg-brand-olive/90 w-full text-white"
          disabled={product.stock === 0}
          onClick={() => {
            const mapped = backendProductToProduct(product);
            addItem(mapped, "0-3M", DEFAULT_CART_COLOR, 1);
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
