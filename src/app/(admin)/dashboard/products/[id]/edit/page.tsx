"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  ImageIcon,
  Loader2,
  Star,
  Upload,
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
import {
  useProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAddProductImage,
  useDeleteProductImage,
  useSetPrimaryProductImage,
} from "@/hooks/use-products";
import {
  useAdjustVariantStock,
  useCreateProductVariant,
  useDeleteProductVariant,
  useUpdateProductVariant,
  useVariantsByProduct,
} from "@/hooks/use-product-variants";
import { useCategories } from "@/hooks/use-categories";
import { AGE_RANGES, PRODUCT_GENDER_API } from "@/config/constants";
import { totalVariantStock } from "@/services/products";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ProductFormValues {
  name: string;
  description: string;
  discount?: number;
  categoryId: string;
  gender: string;
  tags: string[];
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const { data: product, isLoading } = useProduct(productId);
  const { data: categories = [], isLoading: loadingCats } = useCategories();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const addImageMutation = useAddProductImage();
  const deleteImageMutation = useDeleteProductImage();
  const setPrimaryMutation = useSetPrimaryProductImage();
  const imageFileRef = useRef<HTMLInputElement>(null);

  const { data: variants = [], isLoading: loadingVariants } =
    useVariantsByProduct(productId);
  const createVariantMutation = useCreateProductVariant();
  const updateVariantMutation = useUpdateProductVariant();
  const deleteVariantMutation = useDeleteProductVariant();
  const adjustStockMutation = useAdjustVariantStock();
  const [stockDraft, setStockDraft] = useState<Record<string, number>>({});
  const [newVariantAge, setNewVariantAge] = useState<string>("");
  const [newVariantPrice, setNewVariantPrice] = useState<string>("");

  const [tagInput, setTagInput] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      discount: undefined,
      categoryId: "",
      gender: "UNISEX",
      tags: [],
    },
  });

  const categoryIdW = useWatch({ control, name: "categoryId" });
  const genderW = useWatch({ control, name: "gender" });
  const tagsW = useWatch({ control, name: "tags" }) ?? [];

  const lastInitProductId = useRef<string | null>(null);
  useEffect(() => {
    if (!product) return;
    if (lastInitProductId.current === product.id) return;
    lastInitProductId.current = product.id;
    reset({
      name: product.name,
      description: product.description,
      discount: product.discount ?? undefined,
      categoryId: product.categoryId,
      gender: product.gender ?? "UNISEX",
      tags: product.tags ?? [],
    });
  }, [product, reset]);

  const variantsStockKey = useMemo(
    () => variants.map((v) => `${v.id}:${v.stock}`).join("|"),
    [variants]
  );

  useEffect(() => {
    const m = Object.fromEntries(variants.map((v) => [v.id, v.stock]));
    queueMicrotask(() => {
      setStockDraft(m);
    });
  }, [variantsStockKey, variants]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tagsW.includes(t)) {
      const next = [...tagsW, t];
      setValue("tags", next, { shouldDirty: true });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const next = tagsW.filter((x) => x !== tag);
    setValue("tags", next, { shouldDirty: true });
  };

  const onSubmit = (values: ProductFormValues) => {
    if (!variants.length) {
      toast.error("Add at least one variant (age range) in Variants & stock below.");
      return;
    }
    updateMutation.mutate({
      id: productId,
      data: {
        name: values.name,
        description: values.description,
        discount:
          values.discount != null && !Number.isNaN(Number(values.discount))
            ? Number(values.discount)
            : undefined,
        categoryId: values.categoryId,
        gender: values.gender,
        tags: values.tags ?? [],
      },
    });
  };

  const saveStockLevels = () => {
    const adjustments = variants
      .map((v) => {
        const next = Math.max(0, Math.floor(stockDraft[v.id] ?? v.stock));
        const delta = next - v.stock;
        return {
          variantId: v.id,
          add: Math.max(0, delta),
          remove: Math.max(0, -delta),
        };
      })
      .filter((a) => a.add > 0 || a.remove > 0);
    if (adjustments.length === 0) {
      toast.message("No stock changes to save");
      return;
    }
    adjustStockMutation.mutate({ productId, body: { adjustments } });
  };

  const takenAgeRanges = new Set(variants.map((v) => v.ageRange));
  const addableAgeRanges = AGE_RANGES.filter((ar) => !takenAgeRanges.has(ar.value));

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

  const sortedImages = [...(product.images ?? [])].sort((a, b) => a.order - b.order);
  const imageBusy =
    addImageMutation.isPending ||
    deleteImageMutation.isPending ||
    setPrimaryMutation.isPending;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const maxOrder = sortedImages.reduce((m, i) => Math.max(m, i.order), -1);
    addImageMutation.mutate({
      productId,
      file,
      isPrimary: sortedImages.length === 0,
      order: maxOrder + 1,
      altText: file.name,
    });
  };

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

            {/* Images — matches backend POST/DELETE/PATCH /products/:id/images */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-5 w-5" /> Product images
                </CardTitle>
                <div>
                  <input
                    ref={imageFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={imageBusy}
                    onClick={() => imageFileRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Add image
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sortedImages.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {sortedImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative h-28 w-28 overflow-hidden rounded-lg border"
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
                        <div className="absolute right-0 bottom-0 left-0 flex gap-0.5 bg-black/50 p-0.5">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7 shrink-0"
                            disabled={imageBusy || img.isPrimary}
                            title="Set as primary"
                            onClick={() =>
                              setPrimaryMutation.mutate({
                                productId,
                                imageId: img.id,
                              })
                            }
                          >
                            <Star className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7 shrink-0"
                            disabled={imageBusy}
                            title="Delete image"
                            onClick={() => {
                              if (!window.confirm("Remove this image?")) return;
                              deleteImageMutation.mutate({
                                productId,
                                imageId: img.id,
                              });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    No images yet. Use &ldquo;Add image&rdquo; to upload.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Variants — GET/POST/PATCH/DELETE /variants, PATCH /variants/stock/adjust */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variants &amp; stock</CardTitle>
                <p className="text-muted-foreground text-xs">
                  Each age range is a variant. Stock is adjusted via the inventory API
                  (not the product PATCH).
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingVariants ? (
                  <p className="text-muted-foreground text-sm">Loading variants…</p>
                ) : variants.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No variants yet. Add an age range to create sellable inventory.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {variants.map((v) => {
                      const label =
                        AGE_RANGES.find((a) => a.value === v.ageRange)?.label ??
                        v.ageRange;
                      return (
                        <div
                          key={v.id}
                          className="bg-muted/40 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:flex-wrap sm:items-end"
                        >
                          <div className="min-w-[140px] flex-1 space-y-1">
                            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Age
                            </p>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-muted-foreground font-mono text-xs">
                              {v.sku}
                            </p>
                          </div>
                          <div className="w-28 space-y-1">
                            <Label className="text-[10px] uppercase">Price (৳)</Label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              defaultValue={v.price}
                              key={`price-${v.id}-${v.price}`}
                              onBlur={(e) => {
                                const n = Number(e.target.value);
                                if (!Number.isFinite(n) || n <= 0) {
                                  toast.error("Price must be greater than 0");
                                  e.target.value = String(v.price);
                                  return;
                                }
                                if (n !== v.price) {
                                  updateVariantMutation.mutate({
                                    id: v.id,
                                    productId,
                                    body: { price: n },
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="w-28 space-y-1">
                            <Label className="text-[10px] uppercase">Stock</Label>
                            <Input
                              type="number"
                              min={0}
                              value={stockDraft[v.id] ?? v.stock}
                              onChange={(e) =>
                                setStockDraft((prev) => ({
                                  ...prev,
                                  [v.id]: Number(e.target.value),
                                }))
                              }
                            />
                          </div>
                          <div className="w-28 space-y-1">
                            <Label className="text-[10px] uppercase">Reorder at</Label>
                            <Input
                              type="number"
                              min={0}
                              defaultValue={v.reorderLevel}
                              key={`reorder-${v.id}-${v.reorderLevel}`}
                              onBlur={(e) => {
                                const n = Math.max(0, Math.floor(Number(e.target.value)));
                                if (n !== v.reorderLevel) {
                                  updateVariantMutation.mutate({
                                    id: v.id,
                                    productId,
                                    body: { reorderLevel: n },
                                  });
                                }
                              }}
                            />
                          </div>
                          <label className="flex cursor-pointer items-center gap-2 text-sm">
                            <Checkbox
                              checked={v.isActive}
                              onCheckedChange={(on) => {
                                updateVariantMutation.mutate({
                                  id: v.id,
                                  productId,
                                  body: { isActive: on === true },
                                });
                              }}
                            />
                            Active
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/40 hover:bg-destructive/10"
                            disabled={deleteVariantMutation.isPending}
                            onClick={() => {
                              if (!window.confirm(`Remove variant (${label})?`)) return;
                              deleteVariantMutation.mutate({ id: v.id, productId });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={adjustStockMutation.isPending}
                      onClick={saveStockLevels}
                    >
                      Save stock levels
                    </Button>
                  </div>
                )}

                {addableAgeRanges.length > 0 && (
                  <div className="flex flex-wrap items-end gap-2 border-t pt-4">
                    <div className="min-w-[200px] flex-1 space-y-1">
                      <Label className="text-xs">Add variant (age range)</Label>
                      <Select
                        value={newVariantAge || undefined}
                        items={addableAgeRanges.map((ar) => ({
                          value: ar.value,
                          label: ar.label,
                        }))}
                        onValueChange={(v) => setNewVariantAge(v ?? "")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose age range" />
                        </SelectTrigger>
                        <SelectContent>
                          {addableAgeRanges.map((ar) => (
                            <SelectItem key={ar.value} value={ar.value}>
                              {ar.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32 space-y-1">
                      <Label className="text-xs">Price (৳)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={newVariantPrice}
                        onChange={(e) => setNewVariantPrice(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        !newVariantAge ||
                        newVariantPrice === "" ||
                        createVariantMutation.isPending
                      }
                      onClick={() => {
                        if (!newVariantAge) return;
                        const price = Number(newVariantPrice);
                        if (!Number.isFinite(price) || price <= 0) {
                          toast.error("Enter a price greater than 0");
                          return;
                        }
                        createVariantMutation.mutate(
                          {
                            productId,
                            ageRange: newVariantAge,
                            price,
                            stock: 0,
                            reorderLevel: 10,
                            isActive: true,
                          },
                          {
                            onSuccess: () => {
                              setNewVariantAge("");
                              setNewVariantPrice("");
                            },
                          }
                        );
                      }}
                    >
                      Add variant
                    </Button>
                  </div>
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
                  <p className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
                    Prices are set per age range in{" "}
                    <span className="font-medium">Variants &amp; stock</span> above.
                  </p>
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
                    <p className="text-muted-foreground text-[11px]">
                      Applies to every age range.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs uppercase">
                      Total stock (all variants)
                    </Label>
                    <p className="text-2xl font-semibold">{totalVariantStock(product)}</p>
                    <p className="text-muted-foreground text-xs">
                      Edit quantities in &ldquo;Variants &amp; stock&rdquo; above, then
                      use &ldquo;Save stock levels&rdquo;.
                    </p>
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
                      value={categoryIdW}
                      items={categories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
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

                <div className="space-y-2">
                  <Label className="text-xs">Gender</Label>
                  <Select
                    value={genderW}
                    items={PRODUCT_GENDER_API.map((g) => ({
                      value: g.value,
                      label: g.label,
                    }))}
                    onValueChange={(val) =>
                      val && setValue("gender", val, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_GENDER_API.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
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
                  {tagsW.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tagsW.map((tag) => (
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
