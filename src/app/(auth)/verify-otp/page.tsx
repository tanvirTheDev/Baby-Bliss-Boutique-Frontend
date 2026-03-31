"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { VerifyOtpForm } from "@/components/forms/verify-otp-form";
import { useVerifyOtp, useResendOtp } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { siteConfig } from "@/config/site";
import { toast } from "sonner";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { pendingVerificationEmail, otpType, clearPendingVerification } = useAuthStore();

  const verifyMutation = useVerifyOtp();
  const resendMutation = useResendOtp();

  useEffect(() => {
    if (!pendingVerificationEmail || !otpType) {
      router.replace("/register");
    }
  }, [pendingVerificationEmail, otpType, router]);

  if (!pendingVerificationEmail || !otpType) {
    return null;
  }

  const handleVerify = async (otp: string) => {
    const result = await verifyMutation.mutateAsync({
      email: pendingVerificationEmail,
      otp,
      type: otpType,
    });

    clearPendingVerification();
    toast.success(result.message);

    if (otpType === "registration") {
      router.push("/login");
    } else {
      router.push("/reset-password");
    }
  };

  const handleResend = async () => {
    await resendMutation.mutateAsync({
      email: pendingVerificationEmail,
      type: otpType,
    });
    toast.success("A new OTP has been sent to your email.");
  };

  return (
    <>
      {/* Left decorative panel */}
      <div className="relative hidden w-[45%] bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-sm">&#x1f476;</span>
          </div>
          <span className="font-heading text-lg font-bold">{siteConfig.name}</span>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading text-3xl leading-tight font-bold">
            Securing your <em className="font-serif">heirloom</em> journey.
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            To ensure the highest safety for your little one&apos;s boutique experience,
            please verify your email identity.
          </p>

          {/* Stepper indicator (decorative on left panel) */}
          <div className="flex items-center gap-0">
            {["Fill Details", "Verify OTP", "Welcome"].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs ${
                      i === 0
                        ? "border-brand-success bg-brand-success/10 text-brand-success"
                        : i === 1
                          ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                          : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {i === 0 ? "&#10003;" : i === 1 ? "&#128274;" : "&#10024;"}
                  </div>
                  <span className="text-muted-foreground text-[9px] font-semibold tracking-wider uppercase">
                    {step}
                  </span>
                </div>
                {i < 2 && <div className="bg-border mx-2 mb-4 h-px w-8" />}
              </div>
            ))}
          </div>

          {/* Decorative image placeholder */}
          <div className="bg-muted relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-2xl shadow-lg" />
        </div>

        {/* Info badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm">
            <span className="bg-brand-success/10 text-brand-success flex h-8 w-8 items-center justify-center rounded-full">
              &#9993;
            </span>
            <span className="text-sm">OTP sent to your email</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm">
            <span className="bg-brand-gold/10 text-brand-gold flex h-8 w-8 items-center justify-center rounded-full">
              &#9201;
            </span>
            <span className="text-sm">Valid for 5 minutes only</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm">
            <span className="bg-brand-info/10 text-brand-info flex h-8 w-8 items-center justify-center rounded-full">
              &#9989;
            </span>
            <span className="text-sm">Secure &amp; encrypted verification</span>
          </div>
        </div>
      </div>

      {/* Right panel — OTP form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8">
        {/* Mobile brand name */}
        <h1 className="font-heading mb-6 text-lg font-bold lg:hidden">
          {siteConfig.name}
        </h1>

        {/* Gradient banner (mobile) */}
        <div className="mb-6 w-full max-w-md overflow-hidden rounded-xl bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-4 text-center lg:hidden">
          <p className="font-heading text-lg font-bold">
            One Step Away from Pure Bliss! &#127872;
          </p>
        </div>

        <VerifyOtpForm
          email={pendingVerificationEmail}
          type={otpType}
          expirySeconds={300}
          maxAttempts={5}
          onVerify={handleVerify}
          onResend={handleResend}
          error={
            verifyMutation.error
              ? ((verifyMutation.error as { error?: string }).error ??
                (verifyMutation.error as { message?: string }).message ??
                "Invalid or expired OTP.")
              : null
          }
          isLoading={verifyMutation.isPending}
        />
      </div>
    </>
  );
}
