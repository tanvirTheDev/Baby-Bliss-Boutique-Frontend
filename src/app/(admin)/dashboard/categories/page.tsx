"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, FolderTree, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import type { Category } from "@/services/categories";
import { cn } from "@/lib/utils";

type ModalMode = "create" | "edit" | "delete" | null;

export default function CategoryManagementPage() {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const openCreate = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setActiveCategory(null);
    setModalMode("create");
  };

  const openEdit = (cat: Category) => {
    setName(cat.name);
    setDescription(cat.description ?? "");
    setImageUrl(cat.image ?? "");
    setActiveCategory(cat);
    setModalMode("edit");
  };

  const openDelete = (cat: Category) => {
    setActiveCategory(cat);
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveCategory(null);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        image: imageUrl.trim() || undefined,
      },
      { onSuccess: closeModal }
    );
  };

  const handleUpdate = () => {
    if (!activeCategory || !name.trim()) return;
    updateMutation.mutate(
      {
        id: activeCategory.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          image: imageUrl.trim() || undefined,
        },
      },
      { onSuccess: closeModal }
    );
  };

  const handleDelete = () => {
    if (!activeCategory) return;
    deleteMutation.mutate(activeCategory.id, { onSuccess: closeModal });
  };

  const toggleActive = (cat: Category) => {
    updateMutation.mutate({
      id: cat.id,
      data: { isActive: !cat.isActive },
    });
  };

  const totalProducts =
    categories?.reduce((sum, c) => sum + (c._count?.products ?? 0), 0) ?? 0;

  const activeCount = categories?.filter((c) => c.isActive).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-wider uppercase">
            Dashboard / Categories
          </p>
          <h1 className="font-heading text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your product categories and collections.
          </p>
        </div>
        <Button
          className="bg-brand-gold hover:bg-brand-gold-dark text-white"
          onClick={openCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-gold/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <FolderTree className="text-brand-gold h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories?.length ?? 0}</p>
              <p className="text-muted-foreground text-xs">Total Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <FolderTree className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-muted-foreground text-xs">Active Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProducts}</p>
              <p className="text-muted-foreground text-xs">Total Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories table */}
      <div className="bg-card rounded-lg border">
        {/* Table header */}
        <div className="text-muted-foreground grid grid-cols-[1fr_120px_100px_80px_100px] items-center gap-4 border-b px-4 py-3 text-xs font-semibold tracking-wider uppercase">
          <span>Category</span>
          <span>Slug</span>
          <span className="text-center">Products</span>
          <span className="text-center">Status</span>
          <span className="text-center">Actions</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="border-brand-gold h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <FolderTree className="text-muted-foreground/40 h-12 w-12" />
            <p className="text-muted-foreground">No categories yet.</p>
            <Button variant="outline" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first category
            </Button>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="grid grid-cols-[1fr_120px_100px_80px_100px] items-center gap-4 border-b px-4 py-4 last:border-b-0"
            >
              {/* Category info */}
              <div className="flex items-center gap-3">
                {cat.image ? (
                  <div className="bg-muted relative h-10 w-10 overflow-hidden rounded-lg">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                    <FolderTree className="text-muted-foreground h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{cat.name}</p>
                  {cat.description && (
                    <p className="text-muted-foreground truncate text-xs">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Slug */}
              <span className="text-muted-foreground truncate font-mono text-xs">
                {cat.slug}
              </span>

              {/* Product count */}
              <div className="text-center">
                <Badge variant="secondary" className="font-mono">
                  {cat._count?.products ?? 0}
                </Badge>
              </div>

              {/* Active toggle */}
              <div className="flex justify-center">
                <button onClick={() => toggleActive(cat)} className="flex items-center">
                  <div
                    className={cn(
                      "h-5 w-9 rounded-full transition-colors",
                      cat.isActive ? "bg-brand-gold" : "bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                        cat.isActive ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </div>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(cat)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => openDelete(cat)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-muted-foreground py-4 text-center text-xs tracking-widest uppercase">
        &copy; {new Date().getFullYear()} Baby Bliss Boutique | Category Management
      </div>

      {/* ────── Create / Edit Dialog ────── */}
      <Dialog
        open={modalMode === "create" || modalMode === "edit"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Create New Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new product category to your store."
                : `Editing "${activeCategory?.name}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider uppercase">
                Category Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rompers & Onesies"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider uppercase">
                Description
                <span className="text-muted-foreground ml-1 font-normal normal-case">
                  (optional)
                </span>
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description for this category..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider uppercase">
                Image URL
                <span className="text-muted-foreground ml-1 font-normal normal-case">
                  (optional)
                </span>
              </Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
              />
              {imageUrl && (
                <div className="bg-muted relative mt-2 h-24 w-24 overflow-hidden rounded-lg border">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              className="bg-brand-gold hover:bg-brand-gold-dark text-white"
              onClick={modalMode === "create" ? handleCreate : handleUpdate}
              disabled={
                !name.trim() || createMutation.isPending || updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : modalMode === "create"
                  ? "Create Category"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ────── Delete Confirmation Dialog ────── */}
      <Dialog
        open={modalMode === "delete"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Delete Category</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete{" "}
              <span className="text-foreground font-semibold">
                {activeCategory?.name}
              </span>
              ? This action cannot be undone.
              {(activeCategory?._count?.products ?? 0) > 0 && (
                <span className="text-destructive mt-2 block text-xs">
                  This category has {activeCategory?._count?.products} product(s)
                  assigned. You must reassign them before deleting.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
