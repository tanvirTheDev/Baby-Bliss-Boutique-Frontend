"use client";

import { LoginForm } from "@/components/forms/login-form";
import { useLogin } from "@/hooks/use-auth";
import { siteConfig } from "@/config/site";
import type { LoginFormValues } from "@/schemas/auth";

export default function LoginPage() {
  const loginMutation = useLogin();

  const handleLogin = (values: LoginFormValues) => {
    loginMutation.mutate({
      email: values.email,
      password: values.password,
    });
  };

  return (
    <>
      {/* Left panel — decorative */}
      <div className="relative hidden w-1/2 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-50 lg:block">
        <div className="flex h-full flex-col items-center justify-center p-12">
          <h2 className="font-heading text-foreground/80 text-lg font-bold italic">
            {siteConfig.name}
          </h2>
          <div className="relative mt-8 aspect-square w-80 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900 to-teal-700 shadow-2xl" />
          <p className="font-heading text-foreground/70 mt-6 text-center text-xl italic">
            {siteConfig.tagline}
          </p>
          <div className="mt-8 flex gap-6 text-xs">
            {siteConfig.features.slice(0, 3).map((f) => (
              <span key={f.label} className="flex items-center gap-1.5">
                <span className="bg-brand-success/20 text-brand-success flex h-4 w-4 items-center justify-center rounded-full">
                  &#10003;
                </span>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <LoginForm onSubmit={handleLogin} isLoading={loginMutation.isPending} />
      </div>
    </>
  );
}
