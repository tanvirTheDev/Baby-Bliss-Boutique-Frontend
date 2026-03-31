"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Heart } from "lucide-react";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { OrderSummary } from "@/components/ecommerce/order-summary";
import type { CheckoutFormValues } from "@/schemas/checkout";

export default function CheckoutPage() {
  const handleSubmit = (values: CheckoutFormValues) => {
    console.log("Checkout:", values);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/cart"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Boutique
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold">Secure Checkout</h1>
        <p className="text-muted-foreground">
          Finalize your selection of heirloom-quality pieces for your little one.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <CheckoutForm onSubmit={handleSubmit} />
        <div className="space-y-4">
          <OrderSummary showCheckoutButton={false} showDiscountCode={false} />

          {/* Trust badges */}
          <div className="text-muted-foreground flex items-center justify-center gap-6 pt-2">
            <ShieldCheck className="h-5 w-5" />
            <Lock className="h-5 w-5" />
            <Heart className="h-5 w-5" />
          </div>
          <p className="text-muted-foreground text-center text-[10px] tracking-wider uppercase">
            SSL Secure Connection
          </p>
        </div>
      </div>
    </div>
  );
}
