"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutSchema, type CheckoutFormValues } from "@/schemas/checkout";
import type { ShippingAddress } from "@/services/shipping-addresses";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => void;
  isLoading?: boolean;
  addresses?: ShippingAddress[];
}

export function CheckoutForm({ onSubmit, isLoading, addresses = [] }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddressId: "",
      paymentMethod: "BKASH",
      fullName: "",
      phoneNumber: "",
      division: "",
      district: "",
      upazila: "",
      area: "",
      street: "",
      zip: "",
    },
  });

  const shippingAddressIdW = useWatch({ control, name: "shippingAddressId" }) ?? "";
  const paymentMethodW = useWatch({ control, name: "paymentMethod" }) ?? "BKASH";

  useEffect(() => {
    if (!shippingAddressIdW) return;
    const selected = addresses.find((a) => a.id === shippingAddressIdW);
    if (!selected) return;

    setValue("fullName", selected.fullName, { shouldDirty: true });
    setValue("phoneNumber", selected.phoneNumber, { shouldDirty: true });
    setValue("division", selected.division, { shouldDirty: true });
    setValue("district", selected.district, { shouldDirty: true });
    setValue("upazila", selected.upazila, { shouldDirty: true });
    setValue("area", selected.area ?? "", { shouldDirty: true });
    setValue("street", selected.street, { shouldDirty: true });
    setValue("zip", selected.zip ?? "", { shouldDirty: true });
  }, [addresses, setValue, shippingAddressIdW]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) => {
        const first = Object.values(errs)[0];
        toast.error(
          first?.message ? String(first.message) : "Please fill the required fields"
        );
      })}
      className="space-y-6"
    >
      {/* Payment method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="bg-brand-gold flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
              0
            </span>
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label className="text-xs font-medium">Choose how you want to pay</Label>
          <select
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            value={paymentMethodW}
            onChange={(e) =>
              setValue(
                "paymentMethod",
                e.target.value as CheckoutFormValues["paymentMethod"],
                { shouldDirty: true }
              )
            }
            disabled={isLoading}
          >
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="ROCKET">Rocket</option>
            <option value="ONLINE">Online</option>
            <option value="COD">Cash on delivery</option>
          </select>
          {errors.paymentMethod && (
            <p className="text-destructive text-xs">{errors.paymentMethod.message}</p>
          )}
          {paymentMethodW === "COD" && (
            <p className="text-muted-foreground text-xs">
              For Cash on Delivery, your phone number is required.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Saved addresses */}
      {addresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="bg-brand-gold flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
                1
              </span>
              Use a saved address (optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-xs font-medium">Saved shipping address</Label>
            <select
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              value={shippingAddressIdW}
              onChange={(e) => setValue("shippingAddressId", e.target.value)}
              disabled={isLoading}
            >
              <option value="">Create a new address below</option>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} · {a.phoneNumber} · {a.street}, {a.upazila}, {a.district}
                </option>
              ))}
            </select>
            <p className="text-muted-foreground text-xs">
              If you select a saved address, the form below will still submit but we’ll
              use the saved one for the order.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="bg-brand-gold flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
              2
            </span>
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Full Name</Label>
              <Input placeholder="Eleanor Rigby" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-destructive text-xs">{errors.fullName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Phone Number</Label>
            <Input placeholder="01XXXXXXXXX" {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-destructive text-xs">{errors.phoneNumber.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="bg-brand-gold flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
              3
            </span>
            Shipping Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Division</Label>
              <Input placeholder="Dhaka" {...register("division")} />
              {errors.division && (
                <p className="text-destructive text-xs">{errors.division.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">District</Label>
              <Input placeholder="Dhaka" {...register("district")} />
              {errors.district && (
                <p className="text-destructive text-xs">{errors.district.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Upazila</Label>
              <Input placeholder="Dhanmondi" {...register("upazila")} />
              {errors.upazila && (
                <p className="text-destructive text-xs">{errors.upazila.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Area (optional)</Label>
              <Input placeholder="Road 10" {...register("area")} />
              {errors.area && (
                <p className="text-destructive text-xs">{errors.area.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Street Address</Label>
            <Input placeholder="House 12, Road 10" {...register("street")} />
            {errors.street && (
              <p className="text-destructive text-xs">{errors.street.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">ZIP (optional)</Label>
            <Input placeholder="1207" {...register("zip")} />
            {errors.zip && (
              <p className="text-destructive text-xs">{errors.zip.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="bg-brand-gold hover:bg-brand-gold-dark w-full py-6 text-lg text-white"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Place Order"}
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        Final Sale &middot; Free Returns Within 30 Days
      </p>
    </form>
  );
}
