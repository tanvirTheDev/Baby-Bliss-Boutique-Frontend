"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    control,
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

  const password = useWatch({ control, name: "password" }) ?? "";
  const agreeToTerms = useWatch({ control, name: "agreeToTerms" });
  const strength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Create Your Account</h1>
        <p className="text-muted-foreground">It&apos;s free and always will be</p>
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
            checked={agreeToTerms === true}
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
