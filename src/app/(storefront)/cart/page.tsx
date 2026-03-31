"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Gift } from "lucide-react";
import { CartItem } from "@/components/ecommerce/cart-item";
import { OrderSummary } from "@/components/ecommerce/order-summary";
import { ProductGrid } from "@/components/ecommerce/product-grid";
import { useCartStore } from "@/stores/cart-store";

export default function CartPage() {
  const { items } = useCartStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading mb-2 text-3xl font-bold">Your Basket</h1>
      <p className="text-muted-foreground mb-8">
        Review your curated selection for your little one.
      </p>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-lg font-medium">
            Your basket is empty
          </p>
          <Link
            href="/shop"
            className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Cart items */}
          <div className="space-y-4">
            {items.map((item, i) => (
              <CartItem
                key={`${item.product.id}-${item.size}-${item.color.name}-${i}`}
                item={item}
              />
            ))}

            {/* Trust badges */}
            <div className="text-muted-foreground flex flex-wrap gap-6 pt-4 text-xs">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="text-brand-success h-4 w-4" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="text-brand-success h-4 w-4" />
                SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Gift className="text-brand-success h-4 w-4" />
                Gift Wrapping Available
              </span>
            </div>
          </div>

          {/* Order summary */}
          <OrderSummary />
        </div>
      )}

      {/* Recommendations */}
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold">You may also love...</h2>
          <Link href="/shop" className="text-primary text-sm font-medium hover:underline">
            Browse all collections
          </Link>
        </div>
        <ProductGrid products={[]} columns={4} />
      </section>
    </div>
  );
}
