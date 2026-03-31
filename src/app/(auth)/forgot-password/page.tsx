"use client";

import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { useForgotPassword } from "@/hooks/use-auth";
import { siteConfig } from "@/config/site";
import type { ForgotPasswordFormValues } from "@/schemas/auth";

export default function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword();

  const handleSubmit = (values: ForgotPasswordFormValues) => {
    forgotMutation.mutate({ email: values.email });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-pink-50 via-white to-pink-50">
      {/* Header */}
      <div className="py-6 text-center">
        <Link href="/" className="font-heading text-brand-pink text-xl font-bold">
          {siteConfig.name}
        </Link>
      </div>

      {/* Form card */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="bg-card w-full max-w-md rounded-2xl border p-8 shadow-lg">
          <ForgotPasswordForm
            onSubmit={handleSubmit}
            isLoading={forgotMutation.isPending}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center">
        <div className="text-muted-foreground mb-4 flex justify-center gap-6 text-xs tracking-wider uppercase">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact Us
          </Link>
        </div>
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
