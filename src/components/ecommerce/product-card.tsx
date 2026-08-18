"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "./price-display";
import { RatingStars } from "./rating-stars";
import { WishlistButton } from "./wishlist-button";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const isOnSale = product.salePrice !== undefined && product.salePrice < product.price;

  return (
    <Card
      className={cn(
        "group bg-card overflow-hidden border transition-shadow hover:shadow-lg",
        className
      )}
    >
      <Link href={`/product/${product.id}`}>
        {/* Image container */}
        <div className="bg-muted relative aspect-square overflow-hidden">
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}

          <WishlistButton productId={product.id} variant="overlay" />

          {/* Badges */}
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            {product.isOrganic && (
              <Badge className="bg-green-600 text-xs text-white">Organic</Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-brand-gold text-xs text-white">New In</Badge>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <RatingStars rating={product.rating} size="sm" showCount={false} />
          {product.rating > 0 && (
            <span className="text-muted-foreground text-xs">{product.rating}</span>
          )}
        </div>

        <Link href={`/product/${product.id}`}>
          <h3 className="hover:text-primary line-clamp-1 text-sm font-medium transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between">
          <PriceDisplay
            price={product.price}
            salePrice={isOnSale ? product.salePrice : undefined}
            size="sm"
          />
        </div>

        <Button className="bg-brand-olive hover:bg-brand-olive/90 w-full text-white">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
