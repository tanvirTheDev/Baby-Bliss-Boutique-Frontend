"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { FREE_SHIPPING_THRESHOLD } from "@/config/constants";
import { cn } from "@/lib/utils";
import { formatBDT } from "@/lib/currency";
import { couponService } from "@/services/coupons";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

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
  const {
    items,
    appliedCoupon,
    setAppliedCoupon,
    getSubtotal,
    getShipping,
    getTax,
    getCouponDiscount,
    getTotal,
  } = useCartStore();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [couponDraft, setCouponDraft] = useState("");
  const [applying, setApplying] = useState(false);

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const discount = getCouponDiscount();
  const total = getTotal();
  const isFreeShipping = shipping === 0;

  const cartLineItems = items.map((i) => ({
    productId: i.product.id,
    variantId: i.variantId,
    quantity: i.quantity,
  }));

  const handleApplyCoupon = async () => {
    const code = couponDraft.trim();
    if (!code) {
      toast.error("Enter a coupon code");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Sign in to use a coupon code");
      return;
    }

    setApplying(true);
    try {
      const res = await couponService.validateCart({
        couponCode: code,
        items: cartLineItems,
      });
      if (!res.success || !res.data) {
        toast.error(res.message ?? "Coupon could not be applied");
        return;
      }
      setAppliedCoupon({
        code: res.data.code,
        discountAmount: res.data.discountAmount,
      });
      setCouponDraft("");
      toast.success(res.message ?? "Coupon applied");
    } catch (e) {
      const err = e as { message?: string };
      toast.error(err.message ?? "Coupon could not be applied");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <Card className={cn("sticky top-20", className)}>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-medium">{formatBDT(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping (Standard)</span>
          <span className={cn("font-medium", isFreeShipping && "text-brand-success")}>
            {isFreeShipping ? "Free" : formatBDT(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span className="font-medium">{formatBDT(tax)}</span>
        </div>

        {discount > 0 && appliedCoupon && (
          <div className="flex justify-between text-sm text-emerald-700">
            <span className="flex items-center gap-2">
              Discount ({appliedCoupon.code})
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-muted-foreground hover:text-foreground inline-flex"
                aria-label="Remove coupon"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
            <span className="font-medium">−{formatBDT(discount)}</span>
          </div>
        )}

        {showDiscountCode && (
          <>
            <Separator />
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                Discount Code
              </p>
              {!isAuthenticated && (
                <p className="text-muted-foreground mb-2 text-xs">
                  <Link href="/login" className="text-primary font-medium underline">
                    Sign in
                  </Link>{" "}
                  to apply a coupon.
                </p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  className="h-9 text-sm"
                  value={couponDraft}
                  onChange={(e) => setCouponDraft(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleApplyCoupon();
                  }}
                  disabled={!isAuthenticated || applying}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={!isAuthenticated || applying || items.length === 0}
                  onClick={() => void handleApplyCoupon()}
                >
                  {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
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
          <span className="text-xl font-bold">{formatBDT(total)}</span>
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
            Free shipping on orders over {formatBDT(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
