"use client";

import { PriceDisplay } from "@/components/ecommerce/price-display";
import { QuantitySelector } from "@/components/ecommerce/quantity-selector";
import { RatingStars } from "@/components/ecommerce/rating-stars";
import { SizePicker } from "@/components/ecommerce/size-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AGE_RANGES } from "@/config/constants";
import { useProduct, useRelatedProducts } from "@/hooks/use-products";
import { backendProductToProduct, DEFAULT_CART_COLOR } from "@/lib/product-adapter";
import { cn } from "@/lib/utils";
import { applyDiscount, totalVariantStock, type ProductImage } from "@/services/products";
import { formatBDT } from "@/lib/currency";
import { useCartStore } from "@/stores/cart-store";
import type { Product, ProductSize } from "@/types";
import { ArrowLeft, ImageIcon, Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function sortImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => a.order - b.order);
}

function ageRangeLabels(values: string[] | undefined): string[] {
  if (!values?.length) return [];
  const map = new Map<string, string>(AGE_RANGES.map((a) => [a.value, a.label]));
  return values.map((v) => map.get(v) ?? v.replace(/_/g, " "));
}

function ProductGallery({
  images,
  name,
  isOrganic,
}: {
  images: ProductImage[];
  name: string;
  isOrganic: boolean;
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(() => {
    if (!images.length) return 0;
    const p = images.findIndex((img) => img.isPrimary);
    return p >= 0 ? p : 0;
  });
  const currentImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      <div className="bg-muted relative mx-auto h-[min(52vh,400px)] w-full overflow-hidden rounded-2xl sm:h-[min(56vh,440px)] lg:mx-0 lg:h-[min(60vh,480px)]">
        {currentImage ? (
          <Image
            src={currentImage.url}
            alt={currentImage.altText ?? name}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
            <ImageIcon className="h-12 w-12 opacity-40" />
            <span className="text-sm">No images yet</span>
          </div>
        )}
        {isOrganic && (
          <Badge className="absolute top-4 left-4 z-10 bg-green-600 text-white">
            Organic
          </Badge>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === selectedImageIndex
                  ? "border-brand-gold ring-brand-gold/30 ring-2"
                  : "hover:border-muted-foreground/30 border-transparent"
              )}
            >
              <Image
                src={img.url}
                alt={img.altText ?? name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductPurchaseBlock({
  product,
  variantStock,
  variantId,
  unitPrice,
}: {
  product: Product;
  /** Stock of the selected age range, not the product total. */
  variantStock: number;
  variantId: string;
  /** Discounted price of the selected age range, charged by the cart. */
  unitPrice: number;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const maxQty = Math.max(1, variantStock);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(
    () => product.sizes[0] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const qty = Math.min(quantity, maxQty);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Size</p>
          <span className="text-muted-foreground text-xs">Select a size</span>
        </div>
        <SizePicker
          selectedSize={selectedSize}
          availableSizes={product.sizes}
          onSelect={setSelectedSize}
        />
      </div>

      <div className="flex items-center gap-4">
        <QuantitySelector
          quantity={qty}
          onIncrement={() => setQuantity((q) => Math.min(maxQty, q + 1))}
          onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
        />
        <Button
          className="bg-brand-olive hover:bg-brand-olive/90 flex-1 text-white"
          disabled={variantStock <= 0 || !variantId}
          onClick={() => {
            if (!selectedSize) {
              toast.error("Please select a size");
              return;
            }
            if (!variantId) {
              toast.error("Please select an age range");
              return;
            }
            if (variantStock <= 0) {
              toast.error("This age range is out of stock");
              return;
            }
            addItem(product, variantId, selectedSize, DEFAULT_CART_COLOR, qty, unitPrice);
            toast.success("Added to cart");
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full"
        disabled={variantStock <= 0 || !variantId}
        onClick={() => {
          if (!selectedSize) {
            toast.error("Please select a size");
            return;
          }
          if (!variantId || variantStock <= 0) return;
          addItem(product, variantId, selectedSize, DEFAULT_CART_COLOR, qty, unitPrice);
          router.push("/checkout");
        }}
      >
        Buy Now
      </Button>
    </>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: backend, isLoading, isError } = useProduct(id);
  const { data: relatedBackend = [] } = useRelatedProducts(id);

  const sortedImages = useMemo(
    () => (backend?.images?.length ? sortImages(backend.images) : []),
    [backend]
  );

  const product = useMemo(
    () => (backend ? backendProductToProduct(backend) : null),
    [backend]
  );

  // Each age range is its own variant with its own price and stock.
  const sellableVariants = useMemo(
    () => (backend?.variants ?? []).filter((v) => v.isActive !== false),
    [backend]
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Default to the first age range that can actually be bought.
  useEffect(() => {
    if (sellableVariants.length === 0) {
      setSelectedVariantId(null);
      return;
    }
    setSelectedVariantId((current) =>
      current && sellableVariants.some((v) => v.id === current)
        ? current
        : (sellableVariants.find((v) => v.stock > 0) ?? sellableVariants[0]).id
    );
  }, [sellableVariants]);

  const selectedVariant =
    sellableVariants.find((v) => v.id === selectedVariantId) ?? null;

  const stockTotal = backend ? totalVariantStock(backend) : 0;
  const variantStock = selectedVariant?.stock ?? 0;

  // Price shown and price charged both come from the selected age range.
  const selectedBasePrice = selectedVariant?.price ?? backend?.minPrice ?? 0;
  const selectedSalePrice =
    backend?.discount != null && backend.discount > 0
      ? applyDiscount(selectedBasePrice, backend.discount)
      : undefined;
  const selectedUnitPrice = selectedSalePrice ?? selectedBasePrice;

  const isOrganic =
    backend?.tags?.some((t) => t.toLowerCase().includes("organic")) ?? false;

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4 py-16">
        <Loader2 className="text-brand-gold h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (isError || !backend || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4 text-lg">Product not found.</p>
        <Link
          href="/shop"
          className="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/shop"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery
          key={sortedImages.map((i) => i.id).join(",")}
          images={sortedImages}
          name={backend.name}
          isOrganic={isOrganic}
        />

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="md"
            />
            <h1 className="font-heading mt-2 text-3xl font-bold">{backend.name}</h1>
            {backend.category && (
              <p className="text-muted-foreground mt-1 text-sm">
                {backend.category.name}
              </p>
            )}
          </div>

          <PriceDisplay
            price={selectedBasePrice}
            salePrice={selectedSalePrice}
            size="lg"
          />

          {stockTotal <= 0 ? (
            <Badge variant="destructive">Out of stock</Badge>
          ) : variantStock <= 0 ? (
            <Badge variant="destructive">Out of stock for this age</Badge>
          ) : (
            <p className="text-muted-foreground text-sm">
              {variantStock} in stock for this age
            </p>
          )}

          {sellableVariants.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Age</p>
                <span className="text-muted-foreground text-xs">Price varies by age</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sellableVariants.map((v) => {
                  const label = ageRangeLabels([v.ageRange])[0];
                  const isSelected = v.id === selectedVariantId;
                  const soldOut = v.stock <= 0;
                  const price =
                    backend.discount != null && backend.discount > 0
                      ? applyDiscount(v.price, backend.discount)
                      : v.price;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={soldOut}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex min-w-[92px] flex-col items-start rounded-md border px-3 py-2 text-left transition-colors",
                        isSelected
                          ? "border-brand-olive bg-brand-olive/10"
                          : "border-input hover:bg-accent",
                        soldOut && "cursor-not-allowed opacity-50 hover:bg-transparent"
                      )}
                    >
                      <span className="text-xs font-medium">{label}</span>
                      <span className="text-sm font-semibold">{formatBDT(price)}</span>
                      {soldOut && (
                        <span className="text-muted-foreground text-[10px]">
                          Sold out
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <ProductPurchaseBlock
            key={`${product.id}-${selectedVariantId ?? "none"}`}
            product={product}
            variantStock={variantStock}
            variantId={selectedVariantId ?? ""}
            unitPrice={selectedUnitPrice}
          />

          <Separator />

          <div>
            <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">
              Description
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {backend.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
