"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth";
import { cn } from "@/lib/utils";

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => void;
  isLoading?: boolean;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-orange-500" },
    { label: "Good", color: "bg-yellow-500" },
    { label: "Strong", color: "bg-green-500" },
  ];

  return { score, ...(levels[score - 1] ?? levels[0]) };
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      agreeToTerms: false as unknown as true,
    },
  });

  const password = watch("password");
  const strength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Create Your Account</h1>
        <p className="text-muted-foreground">It&apos;s free and always will be</p>
      </div>

      {/* Social signup */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" type="button">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </Button>
        <Button
          className="flex-1 bg-[#1877F2] text-white hover:bg-[#166FE5]"
          type="button"
        >
          <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Sign up with Facebook
        </Button>
      </div>

      <div className="relative">
        <Separator />
        <span className="bg-background text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-xs">
          OR
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider uppercase">
            Full Name
          </Label>
          <Input placeholder="Jane Doe" {...register("fullName")} />
          {errors.fullName && (
            <p className="text-destructive text-xs">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider uppercase">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="email"
              placeholder="jane@example.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider uppercase">
            Phone Number
            <span className="text-muted-foreground ml-1 font-normal normal-case">
              (optional)
            </span>
          </Label>
          <Input placeholder="+8801XXXXXXXXX" {...register("phoneNumber")} />
          {errors.phoneNumber && (
            <p className="text-destructive text-xs">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold tracking-wider uppercase">
            Password
          </Label>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10 pl-10"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {password && (
            <div className="space-y-1">
              <div className="flex h-1.5 gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-full flex-1 rounded-full transition-colors",
                      i <= strength.score ? strength.color : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Strength: {strength.label}
              </p>
            </div>
          )}
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={watch("agreeToTerms") === true}
            onCheckedChange={(checked) =>
              setValue(
                "agreeToTerms",
                checked === true ? true : (false as unknown as true)
              )
            }
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed font-normal">
            I agree to the{" "}
            <Link href="/terms" className="text-primary font-medium underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary font-medium underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-destructive text-xs">{errors.agreeToTerms.message}</p>
        )}

        <Button
          type="submit"
          className="bg-brand-gold hover:bg-brand-gold-dark w-full text-white"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-gold hover:text-brand-gold-dark font-medium"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}
