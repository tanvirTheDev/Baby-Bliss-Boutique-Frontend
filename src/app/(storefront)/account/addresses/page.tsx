"use client";

import { useMe } from "@/hooks/use-users";
import {
  useCreateShippingAddress,
  useDeleteShippingAddress,
  useUserShippingAddresses,
} from "@/hooks/use-shipping-addresses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AddressesPage() {
  const { data: me } = useMe();
  const userId = me?.id ?? "";
  const { data: addresses, isLoading } = useUserShippingAddresses(userId);
  const createAddress = useCreateShippingAddress();
  const deleteAddress = useDeleteShippingAddress();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    division: "",
    district: "",
    upazila: "",
    area: "",
    street: "",
    zip: "",
  });

  const submit = () => {
    createAddress.mutate(
      {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        division: form.division,
        district: form.district,
        upazila: form.upazila,
        area: form.area || undefined,
        street: form.street,
        zip: form.zip || undefined,
        isDefault: true,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({
            fullName: "",
            phoneNumber: "",
            division: "",
            district: "",
            upazila: "",
            area: "",
            street: "",
            zip: "",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">My Addresses</h2>
          <p className="text-muted-foreground text-sm">
            Saved delivery addresses for faster checkout.
          </p>
        </div>
        <Button
          className="bg-brand-gold hover:bg-brand-gold-dark text-white"
          onClick={() => setOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="text-brand-gold h-7 w-7 animate-spin" />
            </div>
          ) : (addresses ?? []).length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              No addresses yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(addresses ?? []).map((a) => (
                <div key={a.id} className="bg-card rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{a.fullName}</p>
                      <p className="text-muted-foreground text-xs">{a.phoneNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => deleteAddress.mutate(a.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 text-sm">
                    <p>{a.street}</p>
                    <p className="text-muted-foreground">
                      {a.area ? `${a.area}, ` : ""}
                      {a.upazila}, {a.district}, {a.division}
                      {a.zip ? ` - ${a.zip}` : ""}
                    </p>
                    {a.isDefault && (
                      <p className="text-brand-gold mt-2 text-xs font-medium">Default</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Full Name</Label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Phone Number</Label>
              <Input
                value={form.phoneNumber}
                onChange={(e) => setForm((s) => ({ ...s, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Division</Label>
              <Input
                value={form.division}
                onChange={(e) => setForm((s) => ({ ...s, division: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">District</Label>
              <Input
                value={form.district}
                onChange={(e) => setForm((s) => ({ ...s, district: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Upazila</Label>
              <Input
                value={form.upazila}
                onChange={(e) => setForm((s) => ({ ...s, upazila: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Area (optional)</Label>
              <Input
                value={form.area}
                onChange={(e) => setForm((s) => ({ ...s, area: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label className="text-xs font-medium">Street</Label>
            <Input
              value={form.street}
              onChange={(e) => setForm((s) => ({ ...s, street: e.target.value }))}
            />
          </div>
          <div className="mt-4 space-y-2">
            <Label className="text-xs font-medium">ZIP (optional)</Label>
            <Input
              value={form.zip}
              onChange={(e) => setForm((s) => ({ ...s, zip: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-gold hover:bg-brand-gold-dark text-white"
              onClick={submit}
              disabled={createAddress.isPending}
            >
              {createAddress.isPending ? "Saving..." : "Save Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
