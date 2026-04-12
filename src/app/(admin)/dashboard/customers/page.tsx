"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Search,
  Shield,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ecommerce/pagination";
import {
  useUsers,
  useUser,
  useAdminUpdateUser,
  useToggleUserActive,
} from "@/hooks/use-users";
import { useUserShippingAddresses } from "@/hooks/use-shipping-addresses";
import type { BackendUser } from "@/services/users";
import { cn } from "@/lib/utils";

type ModalMode = "view" | "edit" | null;

export default function CustomersAdminPage() {
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "CUSTOMER" | "ADMIN">("CUSTOMER");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">("all");
  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchDraft), 350);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(roleFilter !== "all" ? { role: roleFilter } : {}),
      ...(activeFilter === "true" ? { isActive: true } : {}),
      ...(activeFilter === "false" ? { isActive: false } : {}),
    }),
    [page, limit, search, roleFilter, activeFilter]
  );

  const { data: listRes, isLoading } = useUsers(listParams);
  const users = listRes?.data ?? [];
  const pagination = listRes?.pagination;

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: detailRes, isLoading: detailLoading } = useUser(activeId ?? "");
  const detail = detailRes?.data;
  const { data: addresses = [], isLoading: addressesLoading } = useUserShippingAddresses(
    activeId ?? ""
  );

  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const updateMutation = useAdminUpdateUser();
  const toggleMutation = useToggleUserActive();

  const openView = (id: string) => {
    setActiveId(id);
    setModalMode("view");
  };

  const openEdit = (u: BackendUser) => {
    setActiveId(u.id);
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditPhone(u.phoneNumber ?? "");
    setEditAvatar(u.avatar ?? "");
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveId(null);
  };

  const handleSaveEdit = () => {
    if (!activeId || !editFullName.trim()) return;
    const payload: {
      fullName: string;
      phoneNumber?: string;
      avatar?: string;
    } = {
      fullName: editFullName.trim(),
    };
    if (editPhone.trim()) payload.phoneNumber = editPhone.trim();
    if (editAvatar.trim()) payload.avatar = editAvatar.trim();
    updateMutation.mutate({ id: activeId, data: payload }, { onSuccess: closeModal });
  };

  const toggleActive = (u: BackendUser) => {
    toggleMutation.mutate({ userId: u.id, isActive: !u.isActive });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-xs tracking-wider uppercase">
          Dashboard / Customers
        </p>
        <h1 className="font-heading text-3xl font-bold">Customers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Search accounts, open profiles, edit details, and activate or deactivate. New
          accounts are created via storefront registration.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            placeholder="Search name or email…"
            value={searchDraft}
            onChange={(e) => {
              setSearchDraft(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter((v ?? "CUSTOMER") as typeof roleFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CUSTOMER">Customers</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
            <SelectItem value="all">All roles</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={activeFilter}
          onValueChange={(v) => {
            setActiveFilter((v ?? "all") as typeof activeFilter);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="text-muted-foreground grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_90px_100px_100px_120px] items-center gap-3 border-b px-4 py-3 text-xs font-semibold tracking-wider uppercase max-lg:hidden">
            <span>User</span>
            <span>Contact</span>
            <span className="text-center">Role</span>
            <span className="text-center">Verified</span>
            <span className="text-center">Active</span>
            <span className="text-center">Actions</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center gap-3 py-20">
              <UserRound className="h-10 w-10 opacity-40" />
              <p>No users match your filters.</p>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-1 gap-3 border-b px-4 py-4 last:border-b-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_90px_100px_100px_120px] lg:items-center"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {u.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.fullName}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {u.id.slice(0, 10)}…
                    </p>
                  </div>
                </div>
                <div className="min-w-0 space-y-0.5 text-sm">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </p>
                  {u.phoneNumber && (
                    <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <Phone className="h-3 w-3 shrink-0" />
                      {u.phoneNumber}
                    </p>
                  )}
                </div>
                <div className="flex justify-start lg:justify-center">
                  <Badge
                    variant={u.role === "ADMIN" ? "default" : "secondary"}
                    className={cn(
                      "uppercase",
                      u.role === "ADMIN" && "bg-violet-600 hover:bg-violet-600"
                    )}
                  >
                    {u.role === "ADMIN" ? (
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      "Customer"
                    )}
                  </Badge>
                </div>
                <div className="flex flex-wrap justify-start gap-1 lg:justify-center">
                  {u.isEmailVerified && (
                    <Badge variant="outline" className="text-[10px]">
                      Email
                    </Badge>
                  )}
                  {u.isPhoneVerified && (
                    <Badge variant="outline" className="text-[10px]">
                      Phone
                    </Badge>
                  )}
                  {!u.isEmailVerified && !u.isPhoneVerified && (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
                <div className="flex justify-start lg:justify-center">
                  <button
                    type="button"
                    onClick={() => toggleActive(u)}
                    disabled={toggleMutation.isPending || u.role === "ADMIN"}
                    className="flex items-center disabled:opacity-40"
                    title={
                      u.role === "ADMIN" ? "Admins cannot be toggled here" : undefined
                    }
                  >
                    <div
                      className={cn(
                        "h-5 w-9 rounded-full transition-colors",
                        u.isActive ? "bg-brand-gold" : "bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                          u.isActive ? "translate-x-4" : "translate-x-0.5"
                        )}
                      />
                    </div>
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-1 lg:justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openView(u.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(u)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <Dialog
        open={modalMode === "view"}
        onOpenChange={(o) => {
          if (!o) closeModal();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer profile</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {activeId}
            </DialogDescription>
          </DialogHeader>
          {detailLoading && !detail && (
            <div className="flex justify-center py-10">
              <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
            </div>
          )}
          {detail && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>
                    {detail.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{detail.fullName}</p>
                  <Badge variant="secondary" className="mt-1 uppercase">
                    {detail.role}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 border-t pt-3">
                <p className="text-muted-foreground text-xs uppercase">Email</p>
                <p>{detail.email}</p>
                {detail.phoneNumber && (
                  <>
                    <p className="text-muted-foreground text-xs uppercase">Phone</p>
                    <p>{detail.phoneNumber}</p>
                  </>
                )}
                <p className="text-muted-foreground text-xs uppercase">Status</p>
                <p>{detail.isActive ? "Active" : "Inactive"}</p>
                <p className="text-muted-foreground text-xs uppercase">Joined</p>
                <p>{new Date(detail.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2 text-xs uppercase">
                  Shipping addresses
                </p>
                {addressesLoading ? (
                  <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                ) : addresses.length === 0 ? (
                  <p className="text-muted-foreground text-xs">None on file.</p>
                ) : (
                  <ul className="space-y-2">
                    {addresses.map((a) => (
                      <li
                        key={a.id}
                        className="bg-muted/50 rounded-md border p-2 text-xs"
                      >
                        <p className="font-medium">{a.fullName}</p>
                        <p className="text-muted-foreground">
                          {a.street}, {a.upazila}, {a.district}
                        </p>
                        {a.isDefault && (
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            Default
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalMode === "edit"}
        onOpenChange={(o) => {
          if (!o) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit customer</DialogTitle>
            <DialogDescription>
              Update profile fields. Email must stay unique.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase">Full name</Label>
              <Input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Email</Label>
              <Input
                type="email"
                value={editEmail}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-muted-foreground text-xs">
                Email cannot be changed from the admin panel.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Phone (optional)</Label>
              <Input
                placeholder="+8801XXXXXXXXX"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase">Avatar URL (optional)</Label>
              <Input
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="bg-brand-gold hover:bg-brand-gold-dark text-white"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending || !editFullName.trim()}
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
