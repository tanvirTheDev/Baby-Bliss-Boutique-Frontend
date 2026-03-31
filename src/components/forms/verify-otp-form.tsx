"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  Clock,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "./otp-input";
import { cn } from "@/lib/utils";

type OtpStatus = "input" | "expired" | "locked";

interface VerifyOtpFormProps {
  email: string;
  type: "registration" | "forgot-password";
  expirySeconds?: number;
  maxAttempts?: number;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function VerifyOtpForm({
  email,
  type,
  expirySeconds = 300,
  maxAttempts = 5,
  onVerify,
  onResend,
  error,
  isLoading = false,
}: VerifyOtpFormProps) {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<OtpStatus>("input");
  const [timeLeft, setTimeLeft] = useState(expirySeconds);
  const [attempts, setAttempts] = useState(maxAttempts);
  const [resending, setResending] = useState(false);
  const [lockTimer, setLockTimer] = useState(15 * 60);

  // Countdown timer
  useEffect(() => {
    if (status !== "input" || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  // Lock countdown
  useEffect(() => {
    if (status !== "locked" || lockTimer <= 0) return;
    const interval = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1) {
          setStatus("input");
          setAttempts(maxAttempts);
          setTimeLeft(expirySeconds);
          setOtp("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, lockTimer, maxAttempts, expirySeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6 || isLoading) return;
    try {
      await onVerify(otp);
    } catch {
      const remaining = attempts - 1;
      setAttempts(remaining);
      setOtp("");
      if (remaining <= 0) {
        setStatus("locked");
        setLockTimer(15 * 60);
      }
    }
  }, [otp, isLoading, onVerify, attempts]);

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
      setTimeLeft(expirySeconds);
      setOtp("");
      setStatus("input");
    } finally {
      setResending(false);
    }
  };

  // Stepper
  const steps = [
    { label: "Fill Details", done: true },
    { label: "Verify OTP", active: true },
    { label: "Welcome", done: false },
  ];

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  step.done
                    ? "border-brand-success bg-brand-success/10 text-brand-success"
                    : step.active
                      ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                      : "border-muted bg-muted text-muted-foreground"
                )}
              >
                {step.done ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : step.active ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <span className="text-xs">&#10024;</span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wider uppercase",
                  step.active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-px w-12",
                  step.done ? "bg-brand-success" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
        {status === "locked" ? (
          // Account locked state
          <div className="space-y-4 text-center">
            <div className="bg-destructive/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
              <ShieldAlert className="text-destructive h-7 w-7" />
            </div>
            <h2 className="font-heading text-xl font-bold">Account Temporarily Locked</h2>
            <p className="text-muted-foreground text-sm">
              Too many incorrect email verification attempts. Please try again after 15
              minutes or recover via alternate email.
            </p>
            <div className="bg-destructive/5 inline-block rounded-lg px-4 py-2">
              <span className="text-destructive font-mono text-lg font-bold">
                Unlock in {formatTime(lockTimer)}
              </span>
            </div>
            <Button variant="link" className="text-primary text-sm">
              Contact Boutique Email Support
            </Button>
          </div>
        ) : status === "expired" ? (
          // Session expired state
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Session Expired</h2>
              <span className="text-destructive font-mono text-sm font-bold">00:00</span>
            </div>
            <p className="text-muted-foreground text-sm">
              The code sent to your inbox is no longer valid for security reasons.
            </p>
            <OtpInput value="" onChange={() => {}} disabled error />
            <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm">
              <span className="text-yellow-600">&#9888;</span>
              <span className="text-yellow-800">
                Your email OTP has expired. Please request a new one.
              </span>
            </div>
            <Button
              onClick={handleResend}
              disabled={resending}
              className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", resending && "animate-spin")} />
              Resend OTP to Email
            </Button>
          </div>
        ) : (
          // Normal input state
          <div className="space-y-5">
            <div className="text-center">
              <div className="bg-muted mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                <AtSign className="text-muted-foreground h-7 w-7" />
              </div>
              <h2 className="font-heading text-xl font-bold">Verify Your Email</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                We&apos;ve sent a 6-digit OTP to{" "}
                <span className="text-foreground font-semibold">{maskEmail(email)}</span>
              </p>
              <button className="text-primary text-xs font-medium hover:underline">
                Change
              </button>
            </div>

            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={isLoading}
              error={!!error}
            />

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-destructive">&#10007;</span>
                <span className="text-destructive">{error}</span>
              </div>
            )}

            {/* Remaining attempts */}
            {attempts < maxAttempts && (
              <p className="text-brand-gold text-center text-xs font-semibold tracking-wider uppercase">
                {attempts} attempts remaining
              </p>
            )}

            {/* Timer */}
            <div className="flex items-center justify-center gap-1.5 text-sm">
              <Clock className="text-destructive h-3.5 w-3.5" />
              <span className="text-destructive">
                OTP expires in {formatTime(timeLeft)}
              </span>
            </div>

            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || isLoading}
              className="bg-foreground text-background hover:bg-foreground/90 w-full"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            {/* Resend options */}
            <div className="space-y-2 text-center">
              <p className="text-muted-foreground text-xs">
                Didn&apos;t receive the OTP?
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Resend via Email
                </button>
                <button className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Resend via SMS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back link */}
      <Link
        href={type === "registration" ? "/register" : "/forgot-password"}
        className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {type === "registration" ? "Registration" : "Login"}
      </Link>
    </div>
  );
}
