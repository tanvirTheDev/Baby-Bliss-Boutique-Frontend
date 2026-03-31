"use client";

import { RegisterForm } from "@/components/forms/register-form";
import { useRegister } from "@/hooks/use-auth";
import { siteConfig } from "@/config/site";
import type { RegisterFormValues } from "@/schemas/auth";

export default function RegisterPage() {
  const registerMutation = useRegister();

  const handleRegister = (values: RegisterFormValues) => {
    const { agreeToTerms, ...data } = values;
    registerMutation.mutate({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber || undefined,
      password: data.password,
    });
  };

  return (
    <>
      {/* Left panel — decorative */}
      <div className="relative hidden w-[45%] bg-gradient-to-br from-green-50 via-green-100 to-pink-50 lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-sm">&#x1f476;</span>
            </div>
            <span className="font-heading text-lg font-bold">{siteConfig.name}</span>
          </div>

          <div>
            <div className="bg-muted relative aspect-[3/4] w-72 overflow-hidden rounded-2xl shadow-xl" />
            <h2 className="font-heading mt-6 text-2xl font-bold">
              Join the Bliss Family Today!
            </h2>
            <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>&#127873;</span> Exclusive member discounts
              </li>
              <li className="flex items-center gap-2">
                <span>&#128230;</span> Track your orders easily
              </li>
              <li className="flex items-center gap-2">
                <span>&#10084;&#65039;</span> Save your wishlist
              </li>
            </ul>
          </div>

          <p className="text-muted-foreground text-xs italic">
            Crafted for precious moments. &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
        <RegisterForm onSubmit={handleRegister} isLoading={registerMutation.isPending} />
      </div>
    </>
  );
}
