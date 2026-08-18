"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Upload, X, Plus, ImageIcon } from "lucide-react";
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
import { useCreateProduct } from "@/hooks/use-products";
import { toast } from "sonner";
import { useCategories } from "@/hooks/use-categories";
import { PRODUCT_GENDER_API } from "@/config/constants";
import {
  AgePriceTable,
  emptyAgeRows,
  rowsToVariants,
  validateAgeRows,
  type AgeVariantRow,
} from "@/components/forms/age-price-table";

interface ProductFormValues {
  name: string;
  description: string;
  discount?: number;
  categoryId: string;
  gender: string;
  tags: string[];
}

interface ImagePreview {
  file: File;
  preview: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const { data: categories = [], isLoading: loadingCats } = useCategories();
  const createMutation = useCreateProduct();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
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

  // Pricing is per age range, so it lives outside react-hook-form as one
  // controlled table rather than sixteen registered field pairs.
  const [ageRows, setAgeRows] = useState<AgeVariantRow[]>(emptyAgeRows);

  const categoryIdW = useWatch({ control, name: "categoryId" });
  const genderW = useWatch({ control, name: "gender" });

  const addFiles = useCallback((files: File[]) => {
    setImages((prev) => {
      const remaining = 5 - prev.length;
      const toAdd = files.slice(0, remaining);
      const previews = toAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...previews];
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        ["image/jpeg", "image/png", "image/webp"].includes(f.type)
      );
      addFiles(files);
    },
    [addFiles]
  );

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      const next = [...tags, t];
      setTags(next);
      setValue("tags", next);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    setValue("tags", next);
  };

  const onSubmit = (values: ProductFormValues) => {
    const problem = validateAgeRows(ageRows);
    if (problem) {
      toast.error(problem);
      return;
    }
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    if (values.discount != null && !Number.isNaN(Number(values.discount))) {
      formData.append("discount", String(Number(values.discount)));
    }
    formData.append("categoryId", values.categoryId);
    formData.append("gender", values.gender || "UNISEX");

    formData.append("variants", JSON.stringify(rowsToVariants(ageRows)));

    values.tags?.forEach((tag) => {
      formData.append("tags", tag);
    });

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    createMutation.mutate(formData, {
      onSuccess: () => {
        router.push("/dashboard/products");
      },
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
          <h1 className="font-heading text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground text-sm">
            Curate a new piece for the Baby Bliss collection.
          </p>
        </div>
        <Button
          className="bg-brand-gold hover:bg-brand-gold-dark text-white"
          onClick={handleSubmit(onSubmit)}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
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
                    {...register("name")}
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
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-destructive text-xs">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Editorial Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" /> Editorial Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="hover:border-brand-gold/50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 transition-colors"
                >
                  <Upload className="text-muted-foreground mb-3 h-8 w-8" />
                  <p className="text-sm font-medium">Drag and drop images here</p>
                  <p className="text-muted-foreground text-xs">
                    Accepts JPG, PNG, WEBP (Max 5MB per file)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) addFiles(Array.from(e.target.files));
                      e.target.value = "";
                    }}
                  />
                </div>

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className="group relative h-20 w-20 overflow-hidden rounded-lg border"
                      >
                        <Image
                          src={img.preview}
                          alt={`Preview ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                        {i === 0 && (
                          <span className="bg-brand-gold absolute top-0.5 left-0.5 rounded px-1 text-[8px] font-bold text-white">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="bg-destructive absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-muted-foreground hover:border-brand-gold hover:text-brand-gold flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed transition-colors"
                      >
                        <Plus className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing & Inventory — one row per age range */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing &amp; Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AgePriceTable rows={ageRows} onChange={setAgeRows} />

                <div className="space-y-2 sm:max-w-[200px]">
                  <Label className="text-xs">Discount (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="0"
                    {...register("discount")}
                  />
                  <p className="text-muted-foreground text-[11px]">
                    Applies to every age range above.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visibility</span>
                  <span className="font-medium">Public</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="font-medium">Immediate</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    className="bg-brand-gold hover:bg-brand-gold-dark flex-1 text-white"
                    disabled={createMutation.isPending}
                  >
                    Publish Now
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
                        val && setValue("categoryId", val, { shouldValidate: true })
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
                  {errors.categoryId && (
                    <p className="text-destructive text-xs">
                      {errors.categoryId.message}
                    </p>
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
                      val && setValue("gender", val, { shouldValidate: true })
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
    </div>
  );
}
