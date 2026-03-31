"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "overlay";
  className?: string;
}

export function WishlistButton({
  productId,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(productId);

  if (variant === "overlay") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleItem(productId);
        }}
        className={cn(
          "absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm transition-all hover:bg-white",
          className
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
          )}
        />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => toggleItem(productId)}
      className={className}
    >
      <Heart className={cn("h-4 w-4", wishlisted ? "fill-red-500 text-red-500" : "")} />
    </Button>
  );
}
