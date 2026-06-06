"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { User, ShoppingBag, MapPin, LogOut, RotateCcw } from "lucide-react";

const nav = [
  { href: "/account", label: "My Account", icon: User },
  { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/account/returns", label: "Returns & exchanges", icon: RotateCcw },
  { href: "/account/addresses", label: "My Addresses", icon: MapPin },
] as const;

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Account
          </p>
          <h1 className="font-heading text-3xl font-bold">
            Welcome{user?.fullName ? `, ${user.fullName}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your profile, orders, returns, and delivery addresses.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="bg-card rounded-xl border p-3">
          <nav className="space-y-1">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/account" && pathname.startsWith(`${item.href}/`));
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-brand-gold/10 text-brand-gold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
