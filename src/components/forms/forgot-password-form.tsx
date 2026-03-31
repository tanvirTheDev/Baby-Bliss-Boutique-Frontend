"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/auth";

interface ForgotPasswordFormProps {
  onSubmit: (values: ForgotPasswordFormValues) => void;
  isLoading?: boolean;
}

export function ForgotPasswordForm({ onSubmit, isLoading }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Icon */}
      <div className="bg-brand-gold-light mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <Lock className="text-brand-gold h-7 w-7" />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-bold">Forgot Your Password?</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a verification OTP
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider uppercase">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="email"
              placeholder="hello@nursery.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send OTP"}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>

      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>
    </div>
  );
}
