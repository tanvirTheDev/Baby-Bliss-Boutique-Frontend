"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  Plus,
  FolderTree,
  TicketPercent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  Package,
  FolderTree,
  TicketPercent,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
} as const;

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof iconMap;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Inventory", href: "/dashboard/products", icon: "Package" },
  { label: "Categories", href: "/dashboard/categories", icon: "FolderTree" },
  { label: "Coupons", href: "/dashboard/coupons", icon: "TicketPercent" },
  { label: "Orders", href: "/dashboard/orders", icon: "ShoppingBag" },
  { label: "Customers", href: "/dashboard/customers", icon: "Users" },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-screen w-64 flex-col border-r">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="bg-sidebar-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <Package className="text-sidebar-primary-foreground h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold">Baby Bliss</p>
          <p className="text-sidebar-foreground/60 text-[10px] tracking-widest uppercase">
            Digital Atelier
          </p>
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Add Product CTA */}
      <div className="px-3 pb-2">
        <Link href="/dashboard/products/new">
          <Button className="bg-brand-gold hover:bg-brand-gold-dark w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Help */}
      <div className="px-3 pb-2">
        <Button
          variant="ghost"
          className="text-sidebar-foreground/60 w-full justify-start"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Help Center
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* User profile */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-sidebar-accent text-xs">
            {user?.fullName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2) ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 truncate">
          <p className="truncate text-sm font-medium">{user?.fullName ?? "User"}</p>
          <p className="text-sidebar-foreground/60 truncate text-xs">
            {user?.role === "ADMIN" ? "Store Manager" : "Staff"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
