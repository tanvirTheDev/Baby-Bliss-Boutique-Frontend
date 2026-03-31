"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkoutSchema, type CheckoutFormValues } from "@/schemas/checkout";

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => void;
  isLoading?: boolean;
}

export function CheckoutForm({ onSubmit, isLoading }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      paymentMethod: "credit_card",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="bg-brand-gold flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
              1
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
            <div className="space-y-2">
              <Label className="text-xs font-medium">Email Address</Label>
              <Input
                type="email"
                placeholder="eleanor@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Phone Number</Label>
            <Input placeholder="+1 (555) 000-0000" {...register("phone")} />
            {errors.phone && (
              <p className="text-destructive text-xs">{errors.phone.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="bg-brand-gold flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
              2
            </span>
            Shipping Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Street Address</Label>
            <Input placeholder="123 Serenity Lane" {...register("street")} />
            {errors.street && (
              <p className="text-destructive text-xs">{errors.street.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium">City</Label>
              <Input placeholder="Evergreen" {...register("city")} />
              {errors.city && (
                <p className="text-destructive text-xs">{errors.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">State</Label>
              <Input placeholder="CA" {...register("state")} />
              {errors.state && (
                <p className="text-destructive text-xs">{errors.state.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">ZIP</Label>
              <Input placeholder="90210" {...register("zip")} />
              {errors.zip && (
                <p className="text-destructive text-xs">{errors.zip.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="bg-brand-gold flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
              3
            </span>
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={watch("paymentMethod")}
            onValueChange={(val) =>
              setValue("paymentMethod", val as "credit_card" | "paypal")
            }
            className="space-y-3"
          >
            <label className="hover:bg-muted/50 has-[[data-state=checked]]:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors">
              <RadioGroupItem value="credit_card" />
              <CreditCard className="text-muted-foreground h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Credit or Debit Card</p>
                <p className="text-muted-foreground text-xs">
                  Securely pay with your Visa, Mastercard, or Amex
                </p>
              </div>
            </label>
            <label className="hover:bg-muted/50 has-[[data-state=checked]]:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors">
              <RadioGroupItem value="paypal" />
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">PayPal</p>
                <p className="text-muted-foreground text-xs">
                  Redirect to PayPal to complete purchase
                </p>
              </div>
            </label>
          </RadioGroup>
          {errors.paymentMethod && (
            <p className="text-destructive mt-2 text-xs">
              {errors.paymentMethod.message}
            </p>
          )}
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
