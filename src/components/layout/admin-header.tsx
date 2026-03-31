"use client";

import { Bell, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";

export function AdminHeader() {
  const { user } = useAuthStore();

  return (
    <header className="bg-background flex h-16 items-center justify-between border-b px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input placeholder="Search orders, products, or customers..." className="pl-10" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="bg-brand-gold absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full text-[8px] text-white">
            3
          </span>
        </Button>
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>

        <div className="ml-2 flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.fullName ?? "Admin User"}</p>
            <p className="text-muted-foreground text-xs">Store Manager</p>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {user?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2) ?? "AU"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
