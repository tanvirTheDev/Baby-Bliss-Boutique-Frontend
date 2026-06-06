"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Lock, Heart } from "lucide-react";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { OrderSummary } from "@/components/ecommerce/order-summary";
import type { CheckoutFormValues } from "@/schemas/checkout";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { useCreateShippingAddress } from "@/hooks/use-shipping-addresses";
import { useCreateOrder } from "@/hooks/use-orders";
import { useMe } from "@/hooks/use-users";
import { useUserShippingAddresses } from "@/hooks/use-shipping-addresses";
import { useAuthStore } from "@/stores/auth-store";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, appliedCoupon, clearCart } = useCartStore();
  const { data: me } = useMe();
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = me?.id ?? "";
  const { data: addresses = [] } = useUserShippingAddresses(userId);
  const createAddress = useCreateShippingAddress();
  const createOrder = useCreateOrder();

  const handleSubmit = async (values: CheckoutFormValues) => {
    if (!accessToken) {
      toast.error("Please sign in to place an order");
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/shop");
      return;
    }

    try {
      const orderItems = items
        .map((i) => ({
          productId: i.product.id,
          // Backfill for old persisted carts (pre-variantId change)
          variantId: (i as unknown as { variantId?: string }).variantId,
          quantity: i.quantity,
        }))
        .filter(
          (x): x is { productId: string; variantId: string; quantity: number } =>
            typeof x.productId === "string" &&
            typeof x.variantId === "string" &&
            x.variantId.length > 0 &&
            typeof x.quantity === "number" &&
            x.quantity > 0
        );

      if (orderItems.length === 0) {
        toast.error("Your cart items are outdated. Please re-add items to cart.");
        clearCart();
        router.push("/shop");
        return;
      }

      const shippingAddressId =
        values.shippingAddressId && values.shippingAddressId.length > 0
          ? values.shippingAddressId
          : (
              await createAddress.mutateAsync({
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                division: values.division,
                district: values.district,
                upazila: values.upazila,
                area: values.area || undefined,
                street: values.street,
                zip: values.zip || undefined,
                isDefault: true,
              })
            ).data.id;

      const orderRes = await createOrder.mutateAsync({
        shippingAddressId,
        items: orderItems,
        couponCode: appliedCoupon?.code ?? undefined,
        paymentMethod: values.paymentMethod,
        phoneNumber: values.phoneNumber,
        notes: undefined,
      });

      clearCart();
      toast.success("Order placed successfully. Continue to payment.");
      router.push(`/payment/${orderRes.data.id}`);
    } catch (e) {
      // hooks already toast, keep fallback
      const err = e as { message?: string };
      toast.error(err.message ?? "Failed to place order");
    }
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
        <CheckoutForm
          onSubmit={handleSubmit}
          isLoading={createAddress.isPending || createOrder.isPending}
          addresses={addresses}
        />
        <div className="space-y-4">
          <OrderSummary showCheckoutButton={false} showDiscountCode={true} />

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
