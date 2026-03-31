"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { FREE_SHIPPING_THRESHOLD } from "@/config/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
  showCheckoutButton?: boolean;
  showDiscountCode?: boolean;
  className?: string;
}

export function OrderSummary({
  showCheckoutButton = true,
  showDiscountCode = true,
  className,
}: OrderSummaryProps) {
  const { getSubtotal, getShipping, getTax, getTotal } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();
  const isFreeShipping = shipping === 0;

  return (
    <Card className={cn("sticky top-20", className)}>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping (Standard)</span>
          <span className={cn("font-medium", isFreeShipping && "text-brand-success")}>
            {isFreeShipping ? "Free" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>

        {showDiscountCode && (
          <>
            <Separator />
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                Discount Code
              </p>
              <div className="flex gap-2">
                <Input placeholder="Enter code" className="h-9 text-sm" />
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex justify-between">
          <span className="font-medium">
            {showCheckoutButton ? "Estimated Total" : "Total"}
          </span>
          <span className="text-xl font-bold">${total.toFixed(2)}</span>
        </div>

        {showCheckoutButton && (
          <Link href="/checkout" className="block">
            <Button className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white">
              Proceed to Checkout &rarr;
            </Button>
          </Link>
        )}

        {!isFreeShipping && (
          <p className="text-muted-foreground text-center text-xs">
            Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
