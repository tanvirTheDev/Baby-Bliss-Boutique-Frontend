"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  X,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { AGE_RANGES } from "@/config/constants";

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  discount?: number;
  categoryId: string;
  ageRange?: string;
  tags: string[];
  stock: number;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isLoading } = useProduct(productId);
  const { data: categories = [], isLoading: loadingCats } = useCategories();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [formReady, setFormReady] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: undefined,
      categoryId: "",
      ageRange: undefined,
      tags: [],
      stock: 0,
    },
  });

  useEffect(() => {
    if (product && !formReady) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        discount: product.discount ?? undefined,
        categoryId: product.categoryId,
        ageRange: product.ageRange ?? undefined,
        tags: product.tags ?? [],
        stock: product.stock,
      });
      setTags(product.tags ?? []);
      setFormReady(true);
    }
  }, [product, formReady, reset]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      const next = [...tags, t];
      setTags(next);
      setValue("tags", next, { shouldDirty: true });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    setValue("tags", next, { shouldDirty: true });
  };

  const onSubmit = (values: ProductFormValues) => {
    updateMutation.mutate(
      {
        id: productId,
        data: {
          name: values.name,
          description: values.description,
          price: Number(values.price),
          discount: values.discount ? Number(values.discount) : undefined,
          categoryId: values.categoryId,
          ageRange: values.ageRange || undefined,
          tags: values.tags,
          stock: Number(values.stock),
        },
      },
      {
        onSuccess: () => {
          router.push("/dashboard/products");
        },
      }
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(productId, {
      onSuccess: () => {
        router.push("/dashboard/products");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-brand-gold h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Product not found.</p>
        <Link href="/dashboard/products">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const primaryImage = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/products"
            className="text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Products
          </Link>
          <h1 className="font-heading text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground text-sm">
            Update details for &ldquo;{product.name}&rdquo;
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button
            className="bg-brand-gold hover:bg-brand-gold-dark text-white"
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending || !isDirty}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          {/* ── Left column ── */}
          <div className="space-y-6">
            {/* Product Identity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>&#9999;&#65039;</span> Product Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold tracking-wider uppercase">
                    Product Name
                  </Label>
                  <Input
                    placeholder="e.g. Organic Cotton Pointelle Knit Romper"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-destructive text-xs">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold tracking-wider uppercase">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Tell the story of this garment..."
                    rows={5}
                    {...register("description", { required: "Description is required" })}
                  />
                  {errors.description && (
                    <p className="text-destructive text-xs">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Images (read-only display) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" /> Current Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.images && product.images.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {product.images.map((img) => (
                      <div
                        key={img.id}
                        className="relative h-24 w-24 overflow-hidden rounded-lg border"
                      >
                        <Image
                          src={img.url}
                          alt={img.altText ?? product.name}
                          fill
                          className="object-cover"
                        />
                        {img.isPrimary && (
                          <span className="bg-brand-gold absolute top-0.5 left-0.5 rounded px-1 text-[8px] font-bold text-white">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    No images uploaded yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-wider uppercase">
                      Regular Price
                    </Label>
                    <div className="relative">
                      <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                        ৳
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...register("price", {
                          required: "Price is required",
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-destructive text-xs">{errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Discount (%)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="0"
                      {...register("discount", { valueAsNumber: true })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-wider uppercase">
                      Stock Quantity
                    </Label>
                    <Input
                      type="number"
                      placeholder="100"
                      {...register("stock", {
                        required: "Stock is required",
                        valueAsNumber: true,
                      })}
                    />
                    {errors.stock && (
                      <p className="text-destructive text-xs">{errors.stock.message}</p>
                    )}
                  </div>
                  <div className="bg-muted/60 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium">{product.rating ?? 0} / 5</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Reviews</span>
                      <span className="font-medium">{product.reviewsCount ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Product Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="max-w-[140px] truncate font-mono text-xs">
                    {product.id}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="bg-brand-gold hover:bg-brand-gold-dark flex-1 text-white"
                    disabled={updateMutation.isPending || !isDirty}
                  >
                    {updateMutation.isPending ? "Saving..." : "Update Product"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Classification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm tracking-wider uppercase">
                  Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  {loadingCats ? (
                    <p className="text-muted-foreground text-xs">Loading...</p>
                  ) : (
                    <Select
                      value={watch("categoryId")}
                      onValueChange={(val) =>
                        val && setValue("categoryId", val, { shouldDirty: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <Label className="text-xs">Age Range</Label>
                  <Select
                    value={watch("ageRange") ?? ""}
                    onValueChange={(val) =>
                      val && setValue("ageRange", val, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map((ar) => (
                        <SelectItem key={ar.value} value={ar.value}>
                          {ar.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label className="text-xs">Product Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Organic, Spring, Knit..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-muted-foreground hover:text-foreground ml-0.5"
                          >
                            &times;
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* ────── Delete Confirmation Dialog ────── */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Delete Product</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete{" "}
              <span className="text-foreground font-semibold">
                &ldquo;{product.name}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
