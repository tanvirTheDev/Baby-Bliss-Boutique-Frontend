"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "./quantity-selector";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const primaryImage =
    item.product.images.find((img) => img.isPrimary) ?? item.product.images[0];
  const effectivePrice = item.product.salePrice ?? item.product.price;

  return (
    <div className="bg-card flex gap-4 rounded-lg border p-4">
      {/* Product image */}
      <div className="bg-muted relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="object-cover"
            sizes="80px"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium">{item.product.name}</h3>
            <p className="text-muted-foreground text-xs">
              Size: {item.size}
              {item.color && (
                <>
                  {" "}
                  &middot; Color: <span className="capitalize">{item.color.name}</span>
                </>
              )}
            </p>
          </div>
          <p className="text-sm font-semibold">
            ${(effectivePrice * item.quantity).toFixed(2)}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={() =>
              updateQuantity(
                item.product.id,
                item.size,
                item.color.name,
                item.quantity + 1
              )
            }
            onDecrement={() =>
              updateQuantity(
                item.product.id,
                item.size,
                item.color.name,
                item.quantity - 1
              )
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive h-8 w-8"
            onClick={() => removeItem(item.product.id, item.size, item.color.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
