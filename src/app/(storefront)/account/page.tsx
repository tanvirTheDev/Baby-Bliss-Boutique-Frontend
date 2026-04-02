"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useMe, useUpdateMe } from "@/hooks/use-users";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

type FormValues = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
};

export default function AccountPage() {
  const { data: me, isLoading } = useMe();
  const updateMe = useUpdateMe();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: { fullName: "", email: "", phoneNumber: "", avatar: "" },
  });

  useEffect(() => {
    if (me) {
      reset({
        fullName: me.fullName ?? "",
        email: me.email ?? "",
        phoneNumber: me.phoneNumber ?? "",
        avatar: me.avatar ?? "",
      });
    }
  }, [me, reset]);

  const onSubmit = (values: FormValues) => {
    updateMe.mutate({
      fullName: values.fullName,
      email: values.email,
      phoneNumber: values.phoneNumber || undefined,
      avatar: values.avatar || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="text-brand-gold h-7 w-7 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Full Name</Label>
                  <Input
                    placeholder="Your name"
                    {...register("fullName", { required: "Full name is required" })}
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-xs">{errors.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Phone (optional)</Label>
                  <Input placeholder="01XXXXXXXXX" {...register("phoneNumber")} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Avatar URL (optional)</Label>
                  <Input placeholder="https://..." {...register("avatar")} />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-brand-gold hover:bg-brand-gold-dark text-white"
                  disabled={updateMe.isPending || !isDirty}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateMe.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
